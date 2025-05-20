import React from 'react';
import { useChat } from '../contexts/ChatContext';

interface ThreadListProps {
  onSelectThread: (threadId: string) => void;
  selectedThreadId?: string;
}

const ThreadList: React.FC<ThreadListProps> = ({ onSelectThread, selectedThreadId }) => {
  const { threads, loading } = useChat();
  
  if (loading) {
    return (
      <div className="text-gray-400 text-center py-4">
        Loading discussions...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          No discussions yet. Start a new one!
        </div>
      ) : (
        threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedThreadId === thread.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-[#2d2d2d]'
            }`}
          >
            <div className="font-medium truncate">{thread.topic}</div>
            <div className="text-sm opacity-75 truncate">
              {new Date(thread.created_at).toLocaleString()}
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default ThreadList;
