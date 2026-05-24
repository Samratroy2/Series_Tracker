// src/pages/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  const { login, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const navigate = useNavigate();

  // ✅ Login
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error(
        'Please enter email and password'
      );
      return;
    }

    const result = await login(
      email,
      password
    );

    if (result.success) {
      toast.success('Login successful');

      setTimeout(() => navigate('/'), 100);
    } else {
      toast.error(result.message);
    }
  };

  // ✅ Guest Login
  const handleGuest = () => {
    continueAsGuest();

    setTimeout(() => navigate('/'), 100);
  };

  const handleForgotPassword = () =>
    navigate('/forgot-password');

  const handleRegister = () =>
    navigate('/register');

  return (
    <div className="login-container">
      <form
        className="login-form"
        onSubmit={(e) =>
          e.preventDefault()
        }
      >
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <div className="password-input-wrapper">
          <input
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <span
            className="eye-icon"
            onClick={() =>
              setShowPassword(
                (prev) => !prev
              )
            }
          >
            {showPassword
              ? '🙈'
              : '👁️'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogin}
        >
          Login
        </button>

        <button
          type="button"
          className="guest"
          onClick={handleGuest}
        >
          Continue as Guest
        </button>

        <div className="login-links">
          <p onClick={handleForgotPassword}>
            Forgot Password?
          </p>

          <p onClick={handleRegister}>
            New here? Register
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;