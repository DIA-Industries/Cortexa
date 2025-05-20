from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import asyncio
from typing import List, Dict, Any

from app.services.agent.agent_manager import AgentManager
from app.services.chat.thread_manager import ThreadManager
from app.services.rag.knowledge_retrieval import KnowledgeRetrieval
from app.core.config import settings
from app.schemas.chat import ChatMessage, ThreadCreate, AgentMessage
from app.schemas.agent import AgentRole

app = FastAPI(
    title="Multi-Agent Collaborative AI Chat Platform",
    description="A platform for multi-agent collaborative reasoning with MCP and A2A integration",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
agent_manager = AgentManager()
thread_manager = ThreadManager()
knowledge_retrieval = KnowledgeRetrieval()

# Store active connections
active_connections: Dict[str, WebSocket] = {}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await knowledge_retrieval.initialize()

@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {"status": "ok", "message": "Multi-Agent Chat Platform API is running"}

@app.post("/api/threads")
async def create_thread(thread_data: ThreadCreate):
    """Create a new discussion thread"""
    thread_id = await thread_manager.create_thread(thread_data.topic)
    
    # Generate prompt templates based on topic
    prompt_templates = await agent_manager.generate_prompt_templates(thread_data.topic)
    
    # Initialize agents for this thread
    await agent_manager.initialize_agents(thread_id, prompt_templates)
    
    return {
        "thread_id": thread_id,
        "topic": thread_data.topic,
        "created_at": thread_manager.get_thread(thread_id).created_at,
        "prompt_templates": prompt_templates
    }

@app.get("/api/threads")
async def list_threads():
    """List all discussion threads"""
    threads = await thread_manager.list_threads()
    return {"threads": threads}

@app.get("/api/threads/{thread_id}")
async def get_thread(thread_id: str):
    """Get a specific thread and its messages"""
    thread = await thread_manager.get_thread(thread_id)
    messages = await thread_manager.get_messages(thread_id)
    return {
        "thread": thread,
        "messages": messages
    }

@app.websocket("/ws/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, thread_id: str):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    
    # Store the connection
    connection_id = f"{thread_id}_{id(websocket)}"
    active_connections[connection_id] = websocket
    
    try:
        # Send thread history to the client
        thread = await thread_manager.get_thread(thread_id)
        messages = await thread_manager.get_messages(thread_id)
        await websocket.send_json({
            "type": "thread_history",
            "thread": thread.dict(),
            "messages": [msg.dict() for msg in messages]
        })
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Create user message
            user_message = ChatMessage(
                thread_id=thread_id,
                sender_type="user",
                sender_id=message_data.get("user_id", "anonymous"),
                content=message_data.get("content", ""),
                parent_id=message_data.get("parent_id")
            )
            
            # Save user message
            saved_message = await thread_manager.add_message(user_message)
            
            # Broadcast user message to all clients in this thread
            await broadcast_to_thread(thread_id, {
                "type": "new_message",
                "message": saved_message.dict()
            })
            
            # Process with agents using A2A protocol
            asyncio.create_task(process_with_agents(thread_id, saved_message))
            
    except WebSocketDisconnect:
        # Remove the connection
        if connection_id in active_connections:
            del active_connections[connection_id]

async def broadcast_to_thread(thread_id: str, message: Dict[str, Any]):
    """Broadcast a message to all clients in a thread"""
    for conn_id, websocket in active_connections.items():
        if conn_id.startswith(f"{thread_id}_"):
            try:
                await websocket.send_json(message)
            except Exception:
                # Connection might be closed
                if conn_id in active_connections:
                    del active_connections[conn_id]

async def process_with_agents(thread_id: str, user_message: ChatMessage):
    """Process user message with agents using A2A protocol"""
    # Get relevant context using RAG
    context = await knowledge_retrieval.retrieve_context(user_message.content)
    
    # Get agents for this thread
    agents = await agent_manager.get_thread_agents(thread_id)
    
    # Start agent discussion
    discussion_messages = []
    
    # Initial agent responses
    for agent in agents:
        # Use MCP to provide context to agent
        agent_response = await agent_manager.get_agent_response(
            agent_id=agent.id,
            thread_id=thread_id,
            user_message=user_message,
            context=context
        )
        
        # Save agent message
        agent_message = ChatMessage(
            thread_id=thread_id,
            sender_type="agent",
            sender_id=agent.id,
            content=agent_response.content,
            parent_id=user_message.id,
            metadata={"role": agent.role}
        )
        
        saved_message = await thread_manager.add_message(agent_message)
        discussion_messages.append(saved_message)
        
        # Broadcast agent message
        await broadcast_to_thread(thread_id, {
            "type": "new_message",
            "message": saved_message.dict()
        })
        
        # Small delay for UI rendering
        await asyncio.sleep(0.5)
    
    # Agent-to-Agent discussion rounds
    for round_num in range(settings.A2A_DISCUSSION_ROUNDS):
        for agent in agents:
            # Get all previous messages in this discussion
            previous_messages = discussion_messages.copy()
            
            # Use A2A protocol for agent-to-agent communication
            agent_response = await agent_manager.get_agent_discussion_response(
                agent_id=agent.id,
                thread_id=thread_id,
                previous_messages=previous_messages,
                context=context
            )
            
            # Save agent message
            agent_message = ChatMessage(
                thread_id=thread_id,
                sender_type="agent",
                sender_id=agent.id,
                content=agent_response.content,
                parent_id=previous_messages[-1].id,
                metadata={
                    "role": agent.role,
                    "round": round_num + 1
                }
            )
            
            saved_message = await thread_manager.add_message(agent_message)
            discussion_messages.append(saved_message)
            
            # Broadcast agent message
            await broadcast_to_thread(thread_id, {
                "type": "new_message",
                "message": saved_message.dict()
            })
            
            # Small delay for UI rendering
            await asyncio.sleep(0.5)
    
    # Final synthesis
    synthesis = await agent_manager.generate_synthesis(
        thread_id=thread_id,
        discussion_messages=discussion_messages
    )
    
    # Save synthesis message
    synthesis_message = ChatMessage(
        thread_id=thread_id,
        sender_type="system",
        sender_id="synthesis",
        content=synthesis,
        parent_id=discussion_messages[-1].id,
        metadata={"type": "synthesis"}
    )
    
    saved_synthesis = await thread_manager.add_message(synthesis_message)
    
    # Broadcast synthesis
    await broadcast_to_thread(thread_id, {
        "type": "new_message",
        "message": saved_synthesis.dict()
    })

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
