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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && sendMessage) {
      // Get the last message ID as parent ID for threading
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const parentId = lastMessage ? lastMessage.id : undefined;
      
      sendMessage(newMessage, parentId);
      setNewMessage('');
    }
  };
  
  // Group messages by parent_id to create threads
  const groupMessagesByThread = () => {
    const threads: Record<string, ChatMessage[]> = {};
    
    // First pass: create thread groups
    messages.forEach(message => {
      const parentId = message.parent_id || 'root';
      if (!threads[parentId]) {
        threads[parentId] = [];
      }
      threads[parentId].push(message);
    });
    
    return threads;
  };
  
  // Render a thread of messages
  const renderThread = (threadMessages: ChatMessage[], level = 0) => {
    return threadMessages.map(message => (
      <div key={message.id} className={`ml-${level * 4}`}>
        <Message 
          message={message} 
          isCurrentUser={message.sender_type === 'user'} 
        />
        {/* Render child messages if they exist */}
        {groupMessagesByThread()[message.id] && (
          <div className="ml-4 pl-4 border-l-2 border-gray-300">
            {renderThread(groupMessagesByThread()[message.id], level + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  // Get root messages (those without parent_id)
  const getRootMessages = () => {
    return messages.filter(message => !message.parent_id);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Render the message thread */}
        {renderThread(getRootMessages())}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input form */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!connected}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-r font-medium ${
              connected 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!connected}
          >
            Send
          </button>
        </form>
        {!connected && (
          <div className="text-red-500 text-sm mt-2">
            Disconnected. Reconnecting...
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageThread;
