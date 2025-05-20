from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid


class ChatMessage(BaseModel):
    """Schema for chat messages"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    thread_id: str
    sender_type: str  # "user", "agent", "system"
    sender_id: str
    content: str
    parent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = {}


class ThreadCreate(BaseModel):
    """Schema for creating a new thread"""
    topic: str
    user_id: Optional[str] = "anonymous"


class Thread(BaseModel):
    """Schema for a discussion thread"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    topic: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = {}


class AgentMessage(BaseModel):
    """Schema for agent-to-agent messages"""
    content: str
    agent_id: str
    metadata: Dict[str, Any] = {}
