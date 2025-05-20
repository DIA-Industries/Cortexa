import React from 'react';
import { useChat } from '../contexts/ChatContext';
import ThreadList from '../components/ThreadList';
import MessageThread from '../components/MessageThread';
import NewThreadForm from '../components/NewThreadForm';
import WebSocketService from '../services/WebSocketService';
import { ChatMessage } from '../types/chat';

const ChatPage: React.FC = () => {
  const { messages, currentThread, setCurrentThread } = useChat();
  const [selectedThreadId, setSelectedThreadId] = React.useState<string | undefined>(undefined);
  
  // Handle thread selection
  const handleSelectThread = async (threadId: string) => {
    if (threadId) {
      setSelectedThreadId(threadId);
      await setCurrentThread(threadId);
    }
  };
  
  // Handle new thread creation
  const handleThreadCreated = async (threadId: string) => {
    if (threadId) {
      await handleSelectThread(threadId);
    }
  };
  
  // Handle new message from WebSocket
  const handleNewMessage = (_message: ChatMessage) => {
    // Message handling is done in ChatContext
  };
  
  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-200">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 flex flex-col bg-[#252525]">
        <div className="p-4 border-b border-gray-700">
          <NewThreadForm onThreadCreated={handleThreadCreated} />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ThreadList 
            onSelectThread={handleSelectThread}
            selectedThreadId={selectedThreadId}
          />
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedThreadId && currentThread ? (
          <div className="flex flex-col h-full">
            {/* Thread header */}
            <div className="bg-[#2d2d2d] px-6 py-4 border-b border-gray-700">
              <h1 className="text-xl font-semibold text-gray-200">
                {currentThread.topic}
              </h1>
            </div>
            
            {/* Thread messages */}
            <div className="flex-1">
              <WebSocketService 
                threadId={selectedThreadId}
                onMessage={handleNewMessage}
              >
                {({ sendMessage }) => (
                  <MessageThread 
                    messages={messages} 
                    sendMessage={sendMessage}
                  />
                )}
              </WebSocketService>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md px-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-200">
                Welcome to Multi-Agent Chat
              </h2>
              <p className="text-gray-400">
                Select an existing discussion from the sidebar or start a new one to begin chatting with AI agents.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
