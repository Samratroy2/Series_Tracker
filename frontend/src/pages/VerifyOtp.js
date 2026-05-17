// frontend\src\pages\VerifyOtp.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerifyOtp = async () => {
    if (!email) {
      alert("Email missing. Restart the password reset process.");
      navigate('/forgot-password');
      return;
    }

    try {
      const res = await fetch('process.env.REACT_APP_API_URL/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('OTP verified. Now set a new password.');
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button onClick={handleVerifyOtp}>Verify OTP</button>
      </form>
    </div>
  );
};

export default VerifyOtp;
