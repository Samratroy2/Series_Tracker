// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');
const User = require('../models/User');

// PUT /api/users/:id — Update profile
router.put('/:id', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, userId: newUserId, password, location } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check for userId uniqueness
    if (newUserId && newUserId !== user.userId) {
      const existingUser = await User.findOne({ userId: newUserId });
      if (existingUser) return res.status(400).json({ error: 'User ID already taken' });
      user.userId = newUserId;
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.location = location || user.location;


    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Handle photo
    if (req.file) {
      if (user.profilePhoto) {
        const oldPath = path.join(__dirname, '../uploads', user.profilePhoto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.profilePhoto = req.file.filename;
    }

    await user.save();

    const { password: _, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/users/:id/profile-photo — Delete profile photo
router.delete('/:id/profile-photo', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.profilePhoto) {
      return res.status(404).json({ error: 'No profile photo found' });
    }

    const filePath = path.join(__dirname, '../uploads', user.profilePhoto);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    user.profilePhoto = undefined;
    await user.save();

    res.json({ message: 'Profile photo deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete profile photo' });
  }
});

module.exports = router;
