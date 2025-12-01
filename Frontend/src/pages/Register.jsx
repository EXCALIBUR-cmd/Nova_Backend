import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ElectricBorder from '../components/ElectricBorder';
import Lanyard from '../components/Lanyard';
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3001/api/auth/register',
        {
          Fullname: {
            firstname: formData.firstname,
            lastname: formData.lastname
          },
          Email: formData.email,
          Password: formData.password
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during registration');
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join us and start chatting with AI</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="firstname">First Name</label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastname">Last Name</label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>

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
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
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

export default Register;
