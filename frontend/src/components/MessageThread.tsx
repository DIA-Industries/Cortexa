import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/chat';
import Message from './Message';

interface MessageThreadProps {
  messages: ChatMessage[];
  sendMessage?: (content: string, parentId?: string) => void;
  connected?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({ 
  messages, 
  sendMessage,
  connected = false
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [newMessage]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && sendMessage && connected && !isSending) {
      try {
        setIsSending(true);
        // Get the last message ID as parent ID for threading
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const parentId = lastMessage ? lastMessage.id : undefined;
        
        await sendMessage(newMessage.trim(), parentId);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Handle enter key to submit
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isCurrentUser={message.sender_type === 'user'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input form */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={connected ? "Type your message..." : "Connecting..."}
            disabled={!connected || isSending}
            className="flex-1 min-h-[40px] max-h-[160px] p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
          />
          <button
            type="submit"
            disabled={!connected || !newMessage.trim() || isSending}
            className={`px-4 py-2 rounded-lg font-medium ${
              connected && newMessage.trim() && !isSending
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
