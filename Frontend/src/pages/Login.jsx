import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ElectricBorder from '../components/ElectricBorder';
import Lanyard from '../components/Lanyard';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Login attempt with:', { Email: formData.email, Password: formData.password });
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        Email: formData.email,
        Password: formData.password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login successful:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-container-split">
      <div className="auth-left-section">
        <ElectricBorder 
          color="#667eea" 
          speed={1.2} 
          chaos={0.8} 
          thickness={2}
          className="auth-electric-card"
        >
          <div className="auth-form-wrapper">
            <h1 className="auth-title">Login</h1>
            <p className="auth-subtitle">Welcome back! Please log in to your account</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </div>
        </ElectricBorder>
      </div>

      <div className="auth-right-section">
        <Lanyard />
      </div>
    </div>
    </>
  );
}

export default Login;
