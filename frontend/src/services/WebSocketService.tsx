import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { ChatMessage } from '../types/chat';

interface WebSocketServiceProps {
  threadId: string;
  onMessage: (message: ChatMessage) => void;
  children: React.ReactNode;
}

const WebSocketService: React.FC<WebSocketServiceProps> = ({ 
  threadId, 
  onMessage, 
  children 
}) => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { addMessage } = useChat();
  
  useEffect(() => {
    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Create new WebSocket connection
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/${threadId}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message' && data.message) {
          addMessage(data.message);
          onMessage(data.message);
        } 
        else if (data.type === 'thread_history' && data.messages) {
          // Handle initial thread history
          data.messages.forEach((msg: ChatMessage) => {
            addMessage(msg);
          });
        }
        else if (data.type === 'error') {
          console.error('WebSocket error:', data.error);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };
    
    wsRef.current = ws;
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [threadId, addMessage, onMessage]);
  
  // Function to send a message through WebSocket
  const sendMessage = (content: string, parentId?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        content,
        parent_id: parentId,
        user_id: 'anonymous' // In a real app, this would be the actual user ID
      };
      
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };
  
  // Provide the WebSocket context to children
  return (
    <div className="websocket-service">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            sendMessage,
            connected
          });
        }
        return child;
      })}
    </div>
  );
};

export default WebSocketService;
