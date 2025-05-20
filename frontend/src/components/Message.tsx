import React from 'react';
import { ChatMessage } from '../types/chat';

interface MessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  // Determine message style based on sender type
  const getMessageStyle = () => {
    switch (message.sender_type) {
      case 'user':
        return 'bg-blue-100 text-blue-900';
      case 'agent':
        // Different colors for different agents
        const roleColor = message.metadata?.agent_role 
          ? getRoleColor(message.metadata.agent_role) 
          : 'bg-green-100 text-green-900';
        return roleColor;
      case 'system':
        return 'bg-purple-100 text-purple-900 font-medium';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  // Get color based on agent role
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'researcher':
        return 'bg-indigo-100 text-indigo-900';
      case 'critic':
        return 'bg-red-100 text-red-900';
      case 'creative':
        return 'bg-yellow-100 text-yellow-900';
      case 'summarizer':
        return 'bg-green-100 text-green-900';
      case 'analyst':
        return 'bg-cyan-100 text-cyan-900';
      default:
        return 'bg-teal-100 text-teal-900';
    }
  };

  // Get sender name
  const getSenderName = () => {
    if (message.sender_type === 'user') {
      return 'You';
    } else if (message.sender_type === 'agent' && message.metadata?.agent_name) {
      return message.metadata.agent_name;
    } else if (message.sender_type === 'system') {
      return 'System';
    }
    return 'Unknown';
  };

  return (
    <div className={`message-container flex w-full mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3/4 rounded-lg px-4 py-2 ${getMessageStyle()}`}>
        <div className="font-medium text-sm mb-1">{getSenderName()}</div>
        <div className="message-content">{message.content}</div>
        {message.sender_type === 'agent' && message.metadata?.agent_role && (
          <div className="text-xs mt-1 opacity-75">
            Role: {message.metadata.agent_role}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
