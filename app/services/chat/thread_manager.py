from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import asyncio

from app.schemas.chat import ChatMessage, Thread
from app.core.config import settings


class ThreadManager:
    """Manager for chat threads and messages"""
    
    def __init__(self):
        # In-memory storage for threads and messages
        # In a production environment, this would use a database
        self.threads: Dict[str, Thread] = {}
        self.messages: Dict[str, List[ChatMessage]] = {}
    
    async def create_thread(self, topic: str) -> str:
        """Create a new discussion thread"""
        thread_id = str(uuid.uuid4())
        thread = Thread(
            id=thread_id,
            topic=topic
        )
        
        self.threads[thread_id] = thread
        self.messages[thread_id] = []
        
        return thread_id
    
    async def get_thread(self, thread_id: str) -> Thread:
        """Get a thread by ID"""
        if thread_id not in self.threads:
            raise ValueError(f"Thread {thread_id} not found")
        
        return self.threads[thread_id]
    
    async def list_threads(self) -> List[Thread]:
        """List all threads"""
        return list(self.threads.values())
    
    async def add_message(self, message: ChatMessage) -> ChatMessage:
        """Add a message to a thread"""
        if message.thread_id not in self.threads:
            raise ValueError(f"Thread {message.thread_id} not found")
        
        # Update thread's updated_at timestamp
        self.threads[message.thread_id].updated_at = datetime.now()
        
        # Add message to thread
        if message.thread_id not in self.messages:
            self.messages[message.thread_id] = []
        
        self.messages[message.thread_id].append(message)
        
        return message
    
    async def get_messages(self, thread_id: str) -> List[ChatMessage]:
        """Get all messages in a thread"""
        if thread_id not in self.threads:
            raise ValueError(f"Thread {thread_id} not found")
        
        return self.messages.get(thread_id, [])
