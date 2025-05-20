import React from 'react';
import { ChatMessage } from '../types/chat';

interface MessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  const getSenderName = () => {
    if (isCurrentUser) return 'You';
    if (message.metadata?.agent_name) return message.metadata.agent_name;
    if (message.sender_type === 'agent') return 'AI Agent';
    return message.sender_type;
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isCurrentUser
            ? 'bg-blue-600 text-white'
            : 'bg-[#2d2d2d] text-gray-200'
        }`}
      >
        <div className="text-sm font-medium mb-1">
          {getSenderName()}
          {message.metadata?.agent_role && (
            <span className="ml-2 text-xs opacity-75">
              ({message.metadata.agent_role})
            </span>
          )}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
};

export default Message;
