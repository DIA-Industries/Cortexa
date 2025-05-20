import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

interface NewThreadFormProps {
  onThreadCreated?: (threadId: string) => void;
}

const NewThreadForm: React.FC<NewThreadFormProps> = ({ onThreadCreated }) => {
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { startNewThread, loading, error } = useChat();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (topic.trim()) {
      setIsCreating(true);
      try {
        const threadId = await startNewThread(topic);
        setTopic('');
        if (onThreadCreated) {
          onThreadCreated(threadId);
        }
      } catch (err) {
        console.error('Error creating thread:', err);
      } finally {
        setIsCreating(false);
      }
    }
  };
  
  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Start a New Discussion</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Discussion Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic for the AI agents to discuss..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreating || loading}
          />
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md font-medium ${
            isCreating || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isCreating || loading}
        >
          {isCreating || loading ? 'Creating...' : 'Start Discussion'}
        </button>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default NewThreadForm;
