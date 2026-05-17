// backend/routes/messageRoutes.js

const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

// Add message to club
router.post('/:id', async (req, res) => {
  try {
    const { user, text } = req.body;
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    club.messages.push({ user, text });
    await club.save();
    res.json(club.messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
