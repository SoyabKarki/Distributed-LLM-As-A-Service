import { useState } from 'react';
import ChatContainer from './components/ChatContainer';
import MessageList from './components/MessageList';
import Message from './components/Message';
import ChatInput from './components/ChatInput';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  // messages is an array of objects with id, role, and content
  // eg: [{ id: 1, role: 'user', content: 'Hello, how are you?' }, 
  // { id: 2, role: 'assistant', content: 'I am good, thank you!' }]
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content) => {
    // Add user message
    const userMessage = { id: Date.now(), role: 'user', content };
    const updatedMessages = [...messages, userMessage];

    // Each time we send a message or receive a response, we update the messages state
    // This ensures that the LLM gets the most recent context when generating a response
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Send full message history to backend
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages.map(({ role, content }) => ({ role, content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message: ' + response.statusText);
      }

      const data = await response.json();
      
      // Add assistant message
      const assistantMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: data.message.content 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: 'Error: ' + error.message 
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