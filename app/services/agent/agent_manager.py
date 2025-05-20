from typing import List, Dict, Any, Optional
import uuid
import asyncio
from datetime import datetime

from app.schemas.agent import Agent, AgentRole, AgentResponse
from app.schemas.chat import ChatMessage
from app.core.config import settings
from app.services.agent.mcp_client import MCPClient
from app.services.agent.a2a_protocol import A2AProtocol


class AgentManager:
    """Manager for AI agents in the platform"""
    
    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self.thread_agents: Dict[str, List[str]] = {}  # Maps thread_id to list of agent_ids
        self.mcp_client = MCPClient()
        self.a2a_protocol = A2AProtocol()
    
    async def generate_prompt_templates(self, topic: str) -> Dict[AgentRole, str]:
        """Generate prompt templates based on discussion topic"""
        # This would typically call an LLM to generate role-specific prompts
        # For now, using predefined templates with topic insertion
        
        templates = {
            AgentRole.RESEARCHER: f"You are a research specialist focusing on {topic}. "
                                 f"Your role is to provide factual information, cite sources, "
                                 f"and ensure discussions are grounded in evidence. "
                                 f"When contributing, focus on finding and sharing relevant information.",
            
            AgentRole.CRITIC: f"You are a critical thinker examining {topic}. "
                             f"Your role is to identify potential issues, challenge assumptions, "
                             f"and ensure logical consistency. "
                             f"When contributing, focus on finding flaws or alternative perspectives.",
            
            AgentRole.CREATIVE: f"You are a creative thinker exploring {topic}. "
                               f"Your role is to suggest novel approaches, make unexpected connections, "
                               f"and think outside conventional boundaries. "
                               f"When contributing, focus on innovative ideas and possibilities.",
            
            AgentRole.SUMMARIZER: f"You are a synthesis specialist for discussions about {topic}. "
                                 f"Your role is to consolidate information, identify key points, "
                                 f"and create coherent summaries. "
                                 f"When contributing, focus on bringing together different perspectives.",
            
            AgentRole.ANALYST: f"You are an analytical expert examining {topic}. "
                              f"Your role is to break down complex issues, identify patterns, "
                              f"and provide structured analysis. "
                              f"When contributing, focus on systematic evaluation of information.",
            
            AgentRole.GENERALIST: f"You are a generalist with broad knowledge about {topic}. "
                                 f"Your role is to provide balanced perspectives, connect different domains, "
                                 f"and ensure comprehensive coverage. "
                                 f"When contributing, focus on integrating diverse viewpoints."
        }
        
        return templates
    
    async def initialize_agents(self, thread_id: str, prompt_templates: Dict[AgentRole, str]) -> List[Agent]:
        """Initialize agents for a new thread based on prompt templates"""
        # Select which agent roles to use for this thread
        selected_roles = list(AgentRole)[:settings.DEFAULT_AGENT_COUNT]
        
        thread_agents = []
        for role in selected_roles:
            agent_id = str(uuid.uuid4())
            agent = Agent(
                id=agent_id,
                name=f"{role.value.capitalize()} Agent",
                role=role,
                description=f"Specialist in {role.value} thinking",
                prompt_template=prompt_templates[role]
            )
            
            self.agents[agent_id] = agent
            thread_agents.append(agent_id)
        
        self.thread_agents[thread_id] = thread_agents
        return [self.agents[agent_id] for agent_id in thread_agents]
    
    async def get_thread_agents(self, thread_id: str) -> List[Agent]:
        """Get all agents for a specific thread"""
        agent_ids = self.thread_agents.get(thread_id, [])
        return [self.agents[agent_id] for agent_id in agent_ids]
    
    async def get_agent_response(
        self, 
        agent_id: str, 
        thread_id: str, 
        user_message: ChatMessage,
        context: List[Dict[str, Any]]
    ) -> AgentResponse:
        """Get response from an agent using MCP"""
        agent = self.agents[agent_id]
        
        # Use MCP to provide context to the agent
        response = await self.mcp_client.get_agent_response(
            agent=agent,
            user_message=user_message.content,
            context=context
        )
        
        return AgentResponse(
            content=response,
            metadata={
                "agent_id": agent_id,
                "agent_role": agent.role,
                "thread_id": thread_id,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    async def get_agent_discussion_response(
        self,
        agent_id: str,
        thread_id: str,
        previous_messages: List[ChatMessage],
        context: List[Dict[str, Any]]
    ) -> AgentResponse:
        """Get agent response in a discussion using A2A protocol"""
        agent = self.agents[agent_id]
        
        # Format previous messages for A2A protocol
        formatted_messages = [
            {
                "content": msg.content,
                "sender_id": msg.sender_id,
                "sender_type": msg.sender_type,
                "metadata": msg.metadata
            }
            for msg in previous_messages
        ]
        
        # Use A2A protocol for agent-to-agent communication
        response = await self.a2a_protocol.process_discussion(
            agent=agent,
            messages=formatted_messages,
            context=context
        )
        
        return AgentResponse(
            content=response,
            metadata={
                "agent_id": agent_id,
                "agent_role": agent.role,
                "thread_id": thread_id,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    async def generate_synthesis(
        self,
        thread_id: str,
        discussion_messages: List[ChatMessage]
    ) -> str:
        """Generate a synthesis of the agent discussion"""
        # Format messages for synthesis
        formatted_messages = [
            {
                "content": msg.content,
                "sender_id": msg.sender_id,
                "sender_type": msg.sender_type,
                "metadata": msg.metadata
            }
            for msg in discussion_messages
        ]
        
        # Use a dedicated synthesizer (could be a specific agent or a separate model)
        synthesis = await self.a2a_protocol.generate_synthesis(formatted_messages)
        
        return synthesis
