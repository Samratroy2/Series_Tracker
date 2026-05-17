// backend\routes\authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 🔒 Send OTP for Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Anime Club" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 OTP for Password Reset',
      html: `
        <h3>Hello ${user.name || 'User'},</h3>
        <p>Your OTP for password reset is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'OTP sent to email successfully' });
  } catch (err) {
    console.error('❌ Email Error:', err);
    res.status(500).json({ message: 'Failed to send OTP email', error: err.message });
  }
});

// ✅ Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
});

// ✅ Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed', error: err.message });
  }
});

// ✅ Signup with unique userId
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    // 🔁 Generate unique userId: name + 4-digit number
    const baseId = name.toLowerCase().replace(/\s+/g, '');
    let userId;
    let isUnique = false;

    while (!isUnique) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      userId = `${baseId}${suffix}`;
      const existing = await User.findOne({ userId });
      if (!existing) isUnique = true;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, userId });

    await newUser.save();
    res.status(201).json({ message: 'Signup successful', userId });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// ✅ Get All Users (Admin only)
router.get('/users', async (req, res) => {
  const { email } = req.query;

  if (email !== 'trysamrat1@gmail.com') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  try {
    const users = await User.find().select('-password -otp -otpExpires');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// ✅ Delete User (Admin only)
router.delete('/users/:id', async (req, res) => {
  const { adminEmail } = req.query;

  if (adminEmail !== 'trysamrat1@gmail.com') {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  try {
    const userId = req.params.id;
    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
