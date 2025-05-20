from typing import List, Dict, Any
import numpy as np
import asyncio
import faiss
from sentence_transformers import SentenceTransformer

from app.core.config import settings


class KnowledgeRetrieval:
    """Service for retrieving relevant knowledge using RAG"""
    
    def __init__(self):
        self.model = None
        self.index = None
        self.documents = []
        self.document_embeddings = None
    
    async def initialize(self):
        """Initialize the RAG components"""
        # In a real implementation, this would load a proper model and index
        # For now, we'll simulate with a small in-memory setup
        
        # Initialize sentence transformer model
        # This would run in a separate thread to avoid blocking
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Get actual dimension from model
        dimension = self.model.get_sentence_embedding_dimension()
        
        # Create a simple FAISS index with the actual dimension
        self.index = faiss.IndexFlatL2(dimension)
        
        # Add some sample documents
        await self.add_sample_documents()
    
    async def add_sample_documents(self):
        """Add sample documents to the index"""
        # Sample documents for demonstration
        self.documents = [
            {
                "id": "doc1",
                "content": "Agent-to-Agent (A2A) protocol enables seamless communication between AI agents.",
                "metadata": {"source": "A2A Documentation"}
            },
            {
                "id": "doc2",
                "content": "Model Context Protocol (MCP) standardizes how agents access external data sources.",
                "metadata": {"source": "MCP Documentation"}
            },
            {
                "id": "doc3",
                "content": "Retrieval-Augmented Generation (RAG) enhances AI responses with external knowledge.",
                "metadata": {"source": "RAG Documentation"}
            },
            {
                "id": "doc4",
                "content": "Multi-agent systems allow for collaborative problem-solving and diverse perspectives.",
                "metadata": {"source": "Multi-Agent Systems Overview"}
            },
            {
                "id": "doc5",
                "content": "Threaded conversations help organize complex discussions into manageable topics.",
                "metadata": {"source": "Conversation Design Principles"}
            }
        ]
        
        # Create embeddings for documents
        contents = [doc["content"] for doc in self.documents]
        self.document_embeddings = self.model.encode(contents)
        
        # Add to index
        self.index.add(np.array(self.document_embeddings).astype('float32'))
    
    async def retrieve_context(self, query: str, max_results: int = None) -> List[Dict[str, Any]]:
        """Retrieve relevant context for a query"""
        if max_results is None:
            max_results = settings.MAX_CONTEXT_DOCUMENTS
        
        if not self.model or not self.index:
            # If not initialized, return empty context
            return []
        
        # Create query embedding
        query_embedding = self.model.encode([query])
        
        # Search for similar documents
        distances, indices = self.index.search(
            np.array(query_embedding).astype('float32'), 
            k=max_results
        )
        
        # Retrieve matching documents
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.documents):
                doc = self.documents[idx].copy()
                doc["score"] = float(distances[0][i])
                results.append(doc)
        
        return results
