from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Multi-Agent Collaborative AI Chat Platform"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]  # For development; restrict in production
    
    # Agent settings
    DEFAULT_AGENT_COUNT: int = 3
    A2A_DISCUSSION_ROUNDS: int = 2
    
    # RAG settings
    VECTOR_DIMENSION: int = 768
    MAX_CONTEXT_DOCUMENTS: int = 5
    
    # Authentication placeholder
    AUTH_ENABLED: bool = False
    SECRET_KEY: str = "placeholder_secret_key"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # WebSocket settings
    WS_PING_INTERVAL: float = 20.0  # seconds
    
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
