import React, { useEffect, useRef, ReactNode } from 'react';
import { useChat } from '../contexts/ChatContext';
import { ChatMessage } from '../types/chat';

interface WebSocketServiceProps {
  threadId: string;
  onMessage: (message: ChatMessage) => void;
  children: (props: { 
    sendMessage: (content: string, parentId?: string) => Promise<void> 
  }) => ReactNode;
}

const WebSocketService: React.FC<WebSocketServiceProps> = ({ 
  threadId, 
  onMessage, 
  children 
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const { addMessage, setMessages } = useChat();
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttemptsRef = useRef(0);
  const hasReceivedHistory = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const sendMessage = async (content: string, parentId?: string): Promise<void> => {
    const waitForConnection = async (retries: number = 0): Promise<void> => {
      if (retries >= 3) {
        throw new Error('Failed to connect to WebSocket');
      }
      
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return waitForConnection(retries + 1);
      }
    };

    try {
      await waitForConnection();
      const message = {
        content,
        parent_id: parentId,
        user_id: 'user'
      };
      wsRef.current!.send(JSON.stringify(message));
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };
  
  useEffect(() => {
    hasReceivedHistory.current = false;
    reconnectAttemptsRef.current = 0;
    
    const connectWebSocket = () => {
      if (!threadId) return;
      
      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      try {
        // Create new WebSocket connection
        const wsUrl = `ws://localhost:8000/ws/${threadId}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          reconnectAttemptsRef.current = 0;
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'thread_history' && !hasReceivedHistory.current) {
              hasReceivedHistory.current = true;
              const nonSystemMessages = data.messages?.filter(
                (msg: ChatMessage) => msg.sender_type !== 'system' || msg.content.includes('synthesized')
              ) || [];
              setMessages(nonSystemMessages);
            }
            else if (data.type === 'new_message' && data.message) {
              if (data.message.sender_type !== 'system' || data.message.content.includes('synthesized')) {
                addMessage(data.message);
                onMessage(data.message);
              }
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          
          // Try to reconnect if under max attempts
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2000);
          }
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
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [threadId, addMessage, onMessage, setMessages]);
  
  return children({ sendMessage });
};

export default WebSocketService;
