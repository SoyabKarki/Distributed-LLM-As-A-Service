import { useState } from 'react'

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  }

  return (
    <div className='app-container'>
      <h1>ChatLLM</h1>
      <form className='prompt-form' onSubmit={handleSubmit}>
        <textarea
          placeholder='Enter your prompt'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          required
        />
        <button type='submit' disabled={loading}>{loading ? 'Thinking...' : 'Send'}</button>
      </form>

      {(loading || response) && (
        <div className='response-container'>
          <h2>Response:</h2>
            <pre>
              {loading ? 'Waiting for the model...' : response}
            </pre>
        </div>
      )}    
    </div>
  )
}

export default App
