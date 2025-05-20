import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/chat';
import Message from './Message';

interface MessageThreadProps {
  messages: ChatMessage[];
  sendMessage?: (content: string, parentId?: string) => Promise<void>;
}

const MessageThread: React.FC<MessageThreadProps> = ({ 
  messages, 
  sendMessage 
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
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);
  
  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !isSending && sendMessage) {
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
      void handleSubmit(e);
    }
  };

  // Filter out system messages except synthesis
  const filteredMessages = messages.filter(message => 
    message.sender_type !== 'system' || message.content.includes('synthesized')
  );
  
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message) => (
          <Message
            key={message.id}
            message={message}
            isCurrentUser={message.sender_type === 'user'}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed message input form at bottom */}
      <div className="sticky bottom-0 bg-[#1e1e1e] border-t border-gray-700 p-4 mt-auto">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isSending ? "Sending..." : "Type your message..."}
            disabled={isSending}
            className="flex-1 min-h-[40px] max-h-[160px] p-3 bg-[#2d2d2d] text-gray-200 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              newMessage.trim() && !isSending
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
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
