function ChatContainer({ children }) {
    return (
      <div className="chat-container">
        <header className="chat-header">
          <h1>ChatLLM</h1>
        </header>
        <main className="chat-main">
          {children}
        </main>
      </div>
    );
  }
  
  export default ChatContainer;