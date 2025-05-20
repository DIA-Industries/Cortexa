from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum
import uuid


class AgentRole(str, Enum):
    """Enum for agent roles"""
    RESEARCHER = "researcher"
    CRITIC = "critic"
    CREATIVE = "creative"
    SUMMARIZER = "summarizer"
    ANALYST = "analyst"
    GENERALIST = "generalist"


class Agent(BaseModel):
    """Schema for an agent"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: AgentRole
    description: str
    prompt_template: str
    metadata: Dict[str, Any] = {}


class AgentResponse(BaseModel):
    """Schema for agent responses"""
    content: str
    confidence: float = 1.0
    metadata: Dict[str, Any] = {}
