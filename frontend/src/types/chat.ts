export interface Thread {
  id: string;
  topic: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_type: 'user' | 'agent' | 'system';
  sender_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface AgentRole {
  role: string;
  name: string;
  description: string;
}

export interface ThreadCreate {
  topic: string;
  user_id?: string;
}

export interface ThreadResponse {
  thread_id: string;
  topic: string;
  created_at: string;
  prompt_templates: Record<string, string>;
}

export interface ThreadsResponse {
  threads: Thread[];
}

export interface ThreadDetailResponse {
  thread: Thread;
  messages: ChatMessage[];
}

export interface WebSocketMessage {
  type: 'new_message' | 'thread_history' | 'error';
  message?: ChatMessage;
  thread?: Thread;
  messages?: ChatMessage[];
  error?: string;
}
