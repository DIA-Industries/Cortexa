import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import ThreadList from '../components/ThreadList';
import MessageThread from '../components/MessageThread';
import NewThreadForm from '../components/NewThreadForm';
import WebSocketService from '../services/WebSocketService';
import { ChatMessage } from '../types/chat';

const ChatPage: React.FC = () => {
  const { messages, currentThread, setCurrentThread } = useChat();
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(undefined);
  
  // Handle thread selection
  const handleSelectThread = async (threadId: string) => {
    setSelectedThreadId(threadId);
    await setCurrentThread(threadId);
  };
  
  // Handle new thread creation
  const handleThreadCreated = (threadId: string) => {
    setSelectedThreadId(threadId);
  };
  
  // Handle new message from WebSocket
  const handleNewMessage = (message: ChatMessage) => {
    // Any additional handling if needed
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 p-4 flex flex-col space-y-4 overflow-y-auto">
        <NewThreadForm onThreadCreated={handleThreadCreated} />
        <ThreadList 
          onSelectThread={handleSelectThread}
          selectedThreadId={selectedThreadId}
        />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedThreadId && currentThread ? (
          <div className="flex flex-col h-full">
            {/* Thread header */}
            <div className="bg-white p-4 shadow">
              <h1 className="text-xl font-bold">{currentThread.topic}</h1>
            </div>
            
            {/* Thread messages */}
            <div className="flex-1 overflow-hidden">
              <WebSocketService 
                threadId={selectedThreadId}
                onMessage={handleNewMessage}
              >
                <MessageThread messages={messages} />
              </WebSocketService>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-bold mb-2">Welcome to Multi-Agent Chat</h2>
              <p>Select a discussion from the sidebar or start a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
