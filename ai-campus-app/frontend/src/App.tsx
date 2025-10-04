import React, { useState, useEffect } from 'react';
import './App.css';

interface BackendStatus {
  status: string;
  message: string;
  timestamp: string;
  routes: {
    auth: string[];
    tasks: string[];
    ai: string[];
  };
}

const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [message, setMessage] = useState<string>('');
  const [healthData, setHealthData] = useState<BackendStatus | null>(null);

  useEffect(() => {
    // Test backend connection
    fetch('https://ai-campus-shipsy-2.onrender.com/api/health')
      .then(response => response.json())
      .then((data: BackendStatus) => {
        setBackendStatus('Connected ✅ - Backend is working!');
        setHealthData(data);
      })
      .catch(error => {
        setBackendStatus('Failed to connect ❌');
      });
  }, []);

  const testRegistration = () => {
    setMessage('Testing registration...');
    fetch('https://ai-campus-shipsy-2.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser' + Date.now(),
        password: 'testpass123',
        email: 'test' + Date.now() + '@example.com'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        setMessage(`Registration test: ${data.error} (This is normal - user might already exist)`);
      } else {
        setMessage('Registration successful! User created.');
      }
    })
    .catch(error => {
      setMessage(`Registration failed: ${error.message}`);
    });
  };

  const testAI = () => {
    setMessage('Testing AI endpoint...');
    fetch('https://ai-campus-shipsy-2.onrender.com/api/ai/test')
      .then(response => response.json())
      .then(data => {
        setMessage(`AI Test: ${JSON.stringify(data)}`);
      })
      .catch(error => {
        setMessage(`AI test failed: ${error.message}`);
      });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Campus Assignment - Task Manager</h1>
        <p>Full-stack application with AI integration</p>
      </header>
      
      <div className="status-panel">
        <h3>Backend Status: {backendStatus}</h3>
        <p>Backend URL: https://ai-campus-shipsy-2.onrender.com/api</p>
        {healthData && (
          <div className="health-info">
            <p><strong>Status:</strong> {healthData.status}</p>
            <p><strong>Message:</strong> {healthData.message}</p>
            <p><strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="test-buttons">
        <button onClick={testRegistration} className="test-btn">
          Test User Registration
        </button>
        
        <button onClick={testAI} className="test-btn">
          Test AI Integration
        </button>
        
        <button 
          onClick={() => window.open('https://ai-campus-shipsy-2.onrender.com/api/health', '_blank')}
          className="test-btn"
        >
          Open Health Endpoint
        </button>
      </div>

      {message && (
        <div className="message-panel">
          <p>{message}</p>
        </div>
      )}

      <div className="features-panel">
        <h3>✅ Assignment Requirements Completed:</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>Authentication</h4>
            <p>User registration and login with JWT</p>
          </div>
          <div className="feature-card">
            <h4>CRUD Operations</h4>
            <p>Create, Read, Update, Delete tasks</p>
          </div>
          <div className="feature-card">
            <h4>Required Fields</h4>
            <p>Text, Enum, Boolean, Calculated fields</p>
          </div>
          <div className="feature-card">
            <h4>Pagination</h4>
            <p>5 items per page</p>
          </div>
          <div className="feature-card">
            <h4>Filtering</h4>
            <p>Search and filter capabilities</p>
          </div>
          <div className="feature-card">
            <h4>AI Integration</h4>
            <p>Gemini AI task analysis</p>
          </div>
        </div>
      </div>

      <div className="api-panel">
        <h3>Available API Endpoints:</h3>
        {healthData?.routes && (
          <div className="endpoints-list">
            <div>
              <h4>Authentication:</h4>
              <ul>
                {healthData.routes.auth.map((route, index) => (
                  <li key={index}>{route}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Tasks:</h4>
              <ul>
                {healthData.routes.tasks.map((route, index) => (
                  <li key={index}>{route}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>AI:</h4>
              <ul>
                {healthData.routes.ai.map((route, index) => (
                  <li key={index}>{route}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
