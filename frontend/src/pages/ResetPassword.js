// frontend/src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Support both navigation state and sessionStorage for page refresh survival
  const email = location.state?.email || sessionStorage.getItem('resetEmail');
  const otp = location.state?.otp || sessionStorage.getItem('resetOTP');

  useEffect(() => {
    console.log('Reset password page loaded with:', { email, otp });

    if (!email || !otp) {
      alert("Missing email or OTP. Restart the password reset process.");
      navigate('/forgot-password');
    } else {
      // Save to sessionStorage for persistence if coming via navigation
      sessionStorage.setItem('resetEmail', email);
      sessionStorage.setItem('resetOTP', otp);
    }
  }, [email, otp, navigate]);

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      alert("Please enter a new password.");
      return;
    }

    const payload = { email, otp, newPassword };
    console.log('Sending payload to backend:', payload);

    try {
      const res = await fetch('process.env.REACT_APP_API_URL/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      alert('✅ Password reset successful. You can now log in.');

      // Clear saved data
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetOTP');

      navigate('/login');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="button" onClick={handleResetPassword}>
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
