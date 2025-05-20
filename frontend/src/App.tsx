import React from 'react';
import { ChatProvider } from './contexts/ChatContext';
import ChatPage from './pages/ChatPage';
import './App.css';

function App() {
  return (
    <ChatProvider>
      <div className="App">
        <ChatPage />
      </div>
    </ChatProvider>
  );
}

export default App;
