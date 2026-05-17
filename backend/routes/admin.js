const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// Admin credentials (hashed password)
const adminUsers = [
  {
    email: 'trysamrat1@gmail.com',
    passwordHash: bcrypt.hashSync('admin123', 10) // Use bcrypt to hash passwords
  }
];

// Dummy analytics data
const analyticsData = {
  totalUsers: 120,
  totalShowsTracked: 320,
  popularGenres: ['Action', 'Adventure', 'Romance'],
  activeClubs: 5
};

// ✅ Admin login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = adminUsers.find((user) => user.email === email);

  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Optional: Generate a dummy token here for future auth
  res.json({
    success: true,
    message: 'Login successful',
    user: { email }
  });
});

// ✅ Analytics route (protected by email check)
router.get('/analytics', (req, res) => {
  const { email } = req.query;

  const isAdmin = adminUsers.some(admin => admin.email === email);
  if (!isAdmin) {
    return res.status(403).json({ message: 'Unauthorized access' });
  }

  res.json(analyticsData);
});

module.exports = router;
