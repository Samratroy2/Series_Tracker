// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const result = await signup(
        name,
        email,
        password
      );

      if (!result.success) {
        toast.error(
          result.message || 'Registration failed'
        );
        return;
      }

      toast.success(
        `🎉 Welcome, ${name}! Registration successful!`
      );

      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error(
        err.message || 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-wrapper ${darkMode ? 'dark' : ''}`}>
      <div className="auth-container">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Registering...'
              : 'Register'}
          </button>
        </form>

        <p>
          Already registered?{' '}
          <Link to="/login">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;