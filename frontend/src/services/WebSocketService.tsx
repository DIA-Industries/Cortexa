import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { ChatMessage } from '../types/chat';

interface WebSocketServiceProps {
  threadId: string;
  onMessage: (message: ChatMessage) => void;
  children: (props: { connected: boolean; sendMessage: (content: string, parentId?: string) => void }) => React.ReactNode;
}

const WebSocketService: React.FC<WebSocketServiceProps> = ({ 
  threadId, 
  onMessage, 
  children 
}) => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { addMessage } = useChat();
  const reconnectTimeoutRef = useRef<number>();
  
  const sendMessage = (content: string, parentId?: string) => {
    if (!wsRef.current || !connected) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      content,
      parent_id: parentId,
      user_id: 'user' // You can replace this with actual user ID if needed
    };

    wsRef.current.send(JSON.stringify(message));
  };
  
  useEffect(() => {
    const connectWebSocket = () => {
      if (!threadId) return;
      
      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Reset connection state
      setConnected(false);
      
      try {
        // Create new WebSocket connection using the backend URL
        const wsUrl = `ws://localhost:8000/ws/${threadId}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnected(true);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'new_message' && data.message) {
              const message = data.message as ChatMessage;
              addMessage(message);
              onMessage(message);
            } 
            else if (data.type === 'thread_history' && Array.isArray(data.messages)) {
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
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnected(false);
          
          // Try to reconnect after a delay
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        wsRef.current = ws;
      } catch (err) {
        console.error('Error creating WebSocket connection:', err);
      }
    };
    
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [threadId, addMessage, onMessage]);
  
  return (
    <div className="relative flex-1 overflow-y-auto">
      {!connected && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
          Connecting...
        </div>
      )}
      {children({ connected, sendMessage })}
    </div>
  );
};

export default WebSocketService;
