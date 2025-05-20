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
    <div className="thread-list">
      <div className="thread-list-header">
        <h2 className="thread-list-title">Discussions</h2>
      </div>
      {loading ? (
        <div className="thread-list-loading">Loading discussions...</div>
      ) : error ? (
        <div className="thread-list-error">{error}</div>
      ) : threads.length === 0 ? (
        <div className="thread-list-empty">No discussions yet. Start a new one!</div>
      ) : (
        <ul className="thread-list-items">
          {threads.map((thread) => (
            <li 
              key={thread.id}
              className={`thread-list-item${selectedThreadId === thread.id ? ' selected' : ''}`}
              onClick={() => onSelectThread(thread.id)}
            >
              <div className="thread-list-topic">{thread.topic}</div>
              <div className="thread-list-date">
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
