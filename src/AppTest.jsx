import React, { useState, useEffect } from 'react';
import './index.css';

// A simplified Box component and application state to test basic React mechanics
function AppTest() {
  // 1. Define our default state
  const defaultBox = {
    color: '#4ECDC4',
    width: 150,
    height: 150,
    x: 0,
    y: 0,
    smile: false
  };

  // 2. Setup state variables using React Hooks
  // boxState holds the current visual properties of our box
  const [boxState, setBoxState] = useState(defaultBox);
  // Optional: A simple state to store text from an input field
  const [inputText, setInputText] = useState("");
  // State for fetching data from the backend (if any)
  const [backendMessage, setBackendMessage] = useState("No message yet");
  // State for holding our saved codes from the backend
  const [savedCodesList, setSavedCodesList] = useState({});

  // 3. useEffect hook to run code when the component first loads (e.g., fetching data)
  useEffect(() => {
    // REAL Frontend talking to a REAL Backend
    fetch('/api/test')
      .then(response => response.json())
      .then(data => {
        console.log("Fetched from backend:", data);
        setBackendMessage(data.message);
      })
      .catch(err => {
        console.error(err);
        setBackendMessage("Error fetching from backend!");
      });
  }, []); // Empty array means this runs ONLY ONCE when the page loads

  // 4. Handlers for buttons and inputs
  const handleMakeRed = () => {
    // Update the box color by merging the old state with the new color
    setBoxState(prevState => ({ ...prevState, color: '#e74c3c' }));
  };

  const handleMakeSmile = () => {
    setBoxState(prevState => ({ ...prevState, smile: !prevState.smile }));
  };

  const handleMoveRight = () => {
    setBoxState(prevState => ({ ...prevState, x: prevState.x + 50 }));
  };

  const handleReset = () => {
    // Revert everything back to default
    setBoxState(defaultBox);
    setInputText("");
  };

  const handleSendToBackend = () => {
    // We send a POST request to our Vite backend
    fetch('/api/echo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText })
    })
    .then(res => res.json())
    .then(data => {
      // We set the backend's response into our state!
      setBackendMessage(data.reply);
    })
    .catch(err => console.error("Error:", err));
  };

  const handleShowCodes = () => {
    // We send a GET request to our Vite backend
    fetch('/api/showcodes', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(data => {
      // We set the backend's response into our state!
      setSavedCodesList(data);
      setBackendMessage("Successfully fetched saved codes!");
    })
    .catch(err => console.error("Error:", err));
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
      <h1>🛠️ Testing Environment</h1>
      <p>This is a simplified React component for testing front-end state and logic.</p>
      
      {/* Navigation back to main app */}
      <button 
        onClick={() => window.location.href = '/'}
        style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        ⬅️ Back to Main App
      </button>

      {/* Control Panel (UI) */}
      <div style={{ backgroundColor: '#2a2a4a', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>Controls</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button onClick={handleMakeRed} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#4ECDC4', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Make Red</button>
          <button onClick={handleMakeSmile} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#4ECDC4', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Toggle Smile</button>
          <button onClick={handleMoveRight} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#4ECDC4', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Move Right</button>
          <button onClick={handleReset} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Reset</button>
        </div>
        
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <label>Test Input Field: </label>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type something..."
            style={{ padding: '8px', borderRadius: '4px', border: 'none', outline: 'none' }}
          />
          <button 
            onClick={handleSendToBackend} 
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Send to Backend 🚀
          </button>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <button onClick={handleShowCodes} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Show Codes</button>
          
          {Object.keys(savedCodesList).length > 0 && (
            <div style={{ backgroundColor: '#1e1e36', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
              <h4 style={{ marginTop: 0, color: '#4ECDC4' }}>Saved Codes:</h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {Object.entries(savedCodesList).map(([name, codeStr]) => (
                  <li key={name} style={{ marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                    <strong style={{ color: '#f1c40f', fontSize: '1.1em' }}>{name}</strong>
                    <pre style={{ backgroundColor: '#0f0f1a', padding: '10px', borderRadius: '4px', overflowX: 'auto', marginTop: '8px', color: '#a9b7c6' }}>
                      <code>{codeStr}</code>
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <p style={{ marginTop: '0' }}>You typed: <span style={{ color: '#4ECDC4', fontWeight: 'bold' }}>{inputText}</span></p>
        </div>
        
        <div>
          <p>Backend Message: <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>{backendMessage}</span></p>
        </div>
      </div>

      {/* Display Area (The Box) */}
      <div style={{ width: '100%', height: '400px', backgroundColor: '#0f0f1a', position: 'relative', overflow: 'hidden', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* The Box Component using inline styles based on state */}
        <div style={{
          width: `${boxState.width}px`,
          height: `${boxState.height}px`,
          backgroundColor: boxState.color,
          transform: `translate(${boxState.x}px, ${boxState.y}px)`,
          transition: 'all 0.3s ease', // Smooth animation when state changes
          borderRadius: '10px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          
          {/* Conditional Rendering: Show smile if boxState.smile is true */}
          {boxState.smile && (
            <div style={{ fontSize: '60px' }}>😀</div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default AppTest;
