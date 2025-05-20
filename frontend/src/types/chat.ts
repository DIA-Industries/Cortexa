export interface Thread {
  id: string;
  topic: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface ThreadCreate {
  topic: string;
  user_id?: string;
}

export interface ThreadResponse {
  thread_id: string;
  topic: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface ThreadsResponse {
  threads: Thread[];
}

export interface ThreadDetailResponse {
  thread: Thread;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_type: 'user' | 'agent' | 'system';
  sender_id: string;
  content: string;
  created_at: string;
  metadata?: {
    agent_name?: string;
    agent_role?: string;
    [key: string]: any;
  };
}
