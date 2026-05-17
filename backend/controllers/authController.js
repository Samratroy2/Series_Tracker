// backend\controllers\authController.js

// backend/controllers/authController.js

const bcrypt = require('bcrypt');
const User = require('../models/User');

// ✅ Signup Controller
exports.signupUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    // Generate unique userId
    const baseId = name.toLowerCase().replace(/\s+/g, '');
    let userId;
    let isUnique = false;

    while (!isUnique) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      userId = `${baseId}${suffix}`;
      const existing = await User.findOne({ userId });
      if (!existing) isUnique = true;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, userId });

    await newUser.save();

    res.status(201).json({ message: 'Signup successful', userId });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// ✅ Login Controller
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Exclude sensitive data from response
    const { password: _, otp, otpExpires, ...safeUser } = user.toObject();

    res.json({ message: 'Login successful', user: safeUser });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
