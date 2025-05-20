import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Thread } from '../types/chat';

interface ThreadListProps {
  onSelectThread: (threadId: string) => void;
  selectedThreadId?: string;
}

const ThreadList: React.FC<ThreadListProps> = ({ onSelectThread, selectedThreadId }) => {
  const { threads, loading, error } = useChat();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Discussions</h2>
      </div>
      
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading discussions...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{error}</div>
      ) : threads.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No discussions yet. Start a new one!</div>
      ) : (
        <ul className="divide-y">
          {threads.map((thread) => (
            <li 
              key={thread.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedThreadId === thread.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelectThread(thread.id)}
            >
              <div className="font-medium">{thread.topic}</div>
              <div className="text-sm text-gray-500 mt-1">
                {formatDate(thread.updated_at)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThreadList;
