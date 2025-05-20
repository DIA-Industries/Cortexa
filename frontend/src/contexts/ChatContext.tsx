import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Thread, ChatMessage } from '../types/chat';
import { fetchThreads, fetchThread, createThread } from '../services/api';

interface ChatContextType {
  threads: Thread[];
  currentThread: Thread | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  setCurrentThread: (threadId: string) => Promise<void>;
  startNewThread: (topic: string) => Promise<string>;
  addMessage: (message: ChatMessage) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThreadState] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all threads on initial load
  useEffect(() => {
    const loadThreads = async () => {
      setLoading(true);
      try {
        const response = await fetchThreads();
        setThreads(response.threads);
      } catch (err) {
        setError('Failed to load threads');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, []);

  // Set current thread and fetch its messages
  const setCurrentThread = async (threadId: string) => {
    setLoading(true);
    try {
      const response = await fetchThread(threadId);
      setCurrentThreadState(response.thread);
      setMessages(response.messages);
    } catch (err) {
      setError('Failed to load thread');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new thread
  const startNewThread = async (topic: string): Promise<string> => {
    setLoading(true);
    try {
      const response = await createThread(topic);
      const newThread = {
        id: response.thread_id,
        topic: response.topic,
        created_at: response.created_at,
        updated_at: response.created_at,
        metadata: {}
      };
      
      setThreads(prevThreads => [newThread, ...prevThreads]);
      setCurrentThreadState(newThread);
      setMessages([]);
      
      return response.thread_id;
    } catch (err) {
      setError('Failed to create thread');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a new message to the current thread
  const addMessage = (message: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  return (
    <ChatContext.Provider
      value={{
        threads,
        currentThread,
        messages,
        loading,
        error,
        setCurrentThread,
        startNewThread,
        addMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
