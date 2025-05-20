import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';

interface NewThreadFormProps {
  onThreadCreated?: (threadId: string) => void;
}

const NewThreadForm: React.FC<NewThreadFormProps> = ({ onThreadCreated }) => {
  const [topic, setTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { startNewThread, loading, error } = useChat();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (topic.trim()) {
      setIsCreating(true);
      try {
        const threadId = await startNewThread(topic);
        setTopic('');
        onThreadCreated?.(threadId);
      } catch (err) {
        console.error('Error creating thread:', err);
      } finally {
        setIsCreating(false);
      }
    }
  };
  
  return (
    <div className="bg-[#2d2d2d] rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic for discussion..."
          className="w-full p-2 bg-[#1e1e1e] text-gray-200 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          disabled={isCreating || loading}
        />
        <button
          type="submit"
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            isCreating || loading || !topic.trim()
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          disabled={isCreating || loading || !topic.trim()}
        >
          {isCreating || loading ? 'Creating...' : 'Start New Discussion'}
        </button>
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default NewThreadForm;
