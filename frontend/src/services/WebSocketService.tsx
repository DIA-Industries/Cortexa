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

  const sendMessage = async (content: string, parentId?: string): Promise<void> => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message = {
      content,
      parent_id: parentId,
      user_id: 'user'
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

      // Create new WebSocket connection
      const wsUrl = `ws://localhost:8000/ws/${threadId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'thread_history') {
            const nonSystemMessages = data.messages?.filter(
              (msg: ChatMessage) => msg.sender_type !== 'system' || msg.content.includes('synthesized')
            ) || [];
            setMessages(nonSystemMessages);
          } else if (data.type === 'new_message' && data.message) {
            addMessage(data.message);
            onMessage(data.message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Reconnect immediately
        connectWebSocket();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [threadId, addMessage, onMessage, setMessages]);

  return children({ sendMessage });
};

export default WebSocketService;
