import { useState } from 'react';
import ChatContainer from './components/ChatContainer';
import MessageList from './components/MessageList';
import Message from './components/Message';
import ChatInput from './components/ChatInput';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content) => {
    // Add user message
    const userMessage = { id: Date.now(), role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content }),
      });

      const data = await response.json();
      
      // Add assistant message
      const assistantMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: 'Error: Could not connect to server.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <MessageList>
        {messages.map(msg => (
          <Message key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {isLoading && <Message role="assistant" content="Thinking..." isLoading />}
      </MessageList>
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </ChatContainer>
  );
}

export default App;