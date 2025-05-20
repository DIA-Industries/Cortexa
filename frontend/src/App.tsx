import { ChatProvider } from './contexts/ChatContext';
import ChatPage from './pages/ChatPage';
import './App.css';

function App() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}

export default App;
