import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const otpRef = useRef(null);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendOtp = async () => {
    setError('');
    setMessage('');
    if (!validateEmail(email)) return setError('Please enter a valid email');
    setLoading(true);
    try {
      const res = await fetch('process.env.REACT_APP_API_URL/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      setMessage('✅ OTP sent! Check your inbox.');
      setOtpSent(true);
      setResendTimer(30);
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setMessage('');
    if (!otp.trim() || !newPassword.trim()) {
      return setError('Please fill in all fields');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await fetch('process.env.REACT_APP_API_URL/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');
      setMessage('🎉 Password reset successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-wrapper ${darkMode ? 'dark' : ''}`}>
      <div className={`auth-container ${error ? 'shake' : ''}`}>
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            otpSent ? handleResetPassword() : handleSendOtp();
          }}
        >
          <h2>Forgot Password</h2>

          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={otpSent}
            required
          />

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                ref={otpRef}
                required
              />
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <span
                  className="eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? otpSent
                ? 'Resetting...'
                : 'Sending OTP...'
              : otpSent
              ? 'Reset Password'
              : 'Send OTP'}
          </button>

          {otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={resendTimer > 0 || loading}
              className="resend-btn"
            >
              {resendTimer > 0
                ? `⏱ Resend OTP in ${resendTimer}s`
                : 'Resend OTP'}
            </button>
          )}

          <button
            type="button"
            className="back-login-btn"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
