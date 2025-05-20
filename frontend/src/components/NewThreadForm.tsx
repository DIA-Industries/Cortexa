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
    <div className="new-thread-form">
      <h2 className="new-thread-title">Start a New Discussion</h2>
      <form onSubmit={handleSubmit}>
        <div className="new-thread-field">
          <label htmlFor="topic" className="new-thread-label">
            Discussion Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic for the AI agents to discuss..."
            className="new-thread-input"
            disabled={isCreating || loading}
          />
        </div>
        <button
          type="submit"
          className="new-thread-button"
          disabled={isCreating || loading}
        >
          {isCreating || loading ? 'Creating...' : 'Start Discussion'}
        </button>
        {error && (
          <div className="new-thread-error">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default NewThreadForm;
