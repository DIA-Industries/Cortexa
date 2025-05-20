import React from 'react';
import { ChatProvider } from './contexts/ChatContext';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}

export default App;
