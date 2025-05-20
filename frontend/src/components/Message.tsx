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
        const roleColor = message.metadata?.role 
          ? getRoleColor(message.metadata.role) 
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
    switch (role) {
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
    } else if (message.sender_type === 'agent') {
      const role = message.metadata?.role || 'Agent';
      return `${role.charAt(0).toUpperCase() + role.slice(1)} Agent`;
    } else if (message.sender_type === 'system') {
      return 'System';
    }
    return 'Unknown';
  };

  // Format message content with markdown-like syntax
  const formatContent = (content: string) => {
    // This is a simple implementation - in a real app, use a markdown parser
    return content
      .split('\n')
      .map((line, i) => <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>);
  };

  return (
    <div className={`flex w-full mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3/4 rounded-lg px-4 py-2 ${getMessageStyle()}`}>
        <div className="font-bold text-sm mb-1">{getSenderName()}</div>
        <div className="text-sm">{formatContent(message.content)}</div>
        {message.metadata?.round && (
          <div className="text-xs mt-1 text-gray-500">
            Round: {message.metadata.round}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
