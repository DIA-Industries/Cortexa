import axios from 'axios';
import { 
  ThreadCreate, 
  ThreadResponse, 
  ThreadsResponse, 
  ThreadDetailResponse 
} from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all threads
export const fetchThreads = async (): Promise<ThreadsResponse> => {
  const response = await api.get('/api/threads');
  return response.data;
};

// Fetch a specific thread and its messages
export const fetchThread = async (threadId: string): Promise<ThreadDetailResponse> => {
  const response = await api.get(`/api/threads/${threadId}`);
  return response.data;
};

// Create a new thread
export const createThread = async (topic: string, userId: string = 'anonymous'): Promise<ThreadResponse> => {
  const threadData: ThreadCreate = {
    topic,
    user_id: userId,
  };
  
  const response = await api.post('/api/threads', threadData);
  return response.data;
};
