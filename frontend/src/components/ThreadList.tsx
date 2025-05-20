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
    <div className="flex flex-col">
      {threads.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          No discussions yet. Start a new one!
        </div>
      ) : (
        threads.map(thread => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`w-full text-left p-2 border-b ${
              selectedThreadId === thread.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <div className="font-medium truncate">{thread.topic}</div>
          </button>
        ))
      )}
    </div>
  );
};

export default ThreadList;
