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
    if (!wsRef.current) {
      console.error('WebSocket is not initialized');
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message = {
      content,
      parent_id: parentId,
      user_id: 'user'
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    let reconnectAttempts = 0;
    let reconnectTimeout: NodeJS.Timeout;
    const MAX_RECONNECT_ATTEMPTS = 10; // Set a maximum retry limit

    const connectWebSocket = () => {
      if (!threadId) return;

      // Avoid creating multiple connections for the same thread ID
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        console.warn('WebSocket connection already exists. Skipping new connection.');
        return;
      }

      // Close any existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Create new WebSocket connection
      const wsUrl = `ws://localhost:8000/ws/${threadId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
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

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff capped at 30 seconds
          reconnectTimeout = setTimeout(connectWebSocket, backoffTime);
        } else {
          console.error('Max reconnect attempts reached. Giving up.');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (error instanceof Event) {
          console.error('Error details:', {
            type: error.type,
            target: error.target
          });
        }
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [threadId, addMessage, onMessage, setMessages]);

  return children({ sendMessage });
};

export default WebSocketService;
