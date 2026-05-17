// src/pages/Login.js


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const { login, continueAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle user login
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      alert('✅ Login successful');
      // Navigate after state update
      setTimeout(() => navigate('/'), 50);
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  // ✅ Guest login
  const handleGuest = () => {
    continueAsGuest();
    setTimeout(() => navigate('/'), 50);
  };

  const handleForgotPassword = () => navigate('/forgot-password');
  const handleRegister = () => navigate('/register');

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <button type="button" onClick={handleLogin}>Login</button>
        <button type="button" className="guest" onClick={handleGuest}>
          Continue as Guest
        </button>

        <div className="login-links">
          <p onClick={handleForgotPassword}>Forgot Password?</p>
          <p onClick={handleRegister}>New here? Register</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
