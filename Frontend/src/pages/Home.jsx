import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Welcome to Nova-Corp</h1>
        <p className="home-subtitle">Your AI-powered conversation companion</p>
        
        <div className="home-description">
          <p>
            Engage in meaningful conversations with our advanced AI assistant. 
            Get instant responses, creative ideas, and helpful insights.
          </p>
        </div>

        <div className="home-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
        </div>

        <div className="home-features">
          <div className="feature">
            <h3>💬 Real-time Chat</h3>
            <p>Instant responses powered by advanced AI</p>
          </div>
          <div className="feature">
            <h3>🔒 Secure</h3>
            <p>Your conversations are encrypted and private</p>
          </div>
          <div className="feature">
            <h3>🚀 Fast</h3>
            <p>Lightning-quick responses optimized for speed</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Home;
