// backend/routes/clubs.js

const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

// GET all clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find();

    // Sort messages in each club by createdAt ascending
    const sortedClubs = clubs.map(club => ({
      ...club.toObject(),
      messages: club.messages?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }));

    res.json(sortedClubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new club
router.post('/', async (req, res) => {
  const { name, createdBy } = req.body;
  try {
    const club = new Club({
      name,
      createdBy,
      members: [createdBy],
      joinRequests: [],
      messages: [],
      polls: []
    });
    await club.save();
    res.status(201).json(club);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a club (creator only)
router.delete('/:id', async (req, res) => {
  const { email } = req.body;
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.createdBy !== email)
      return res.status(403).json({ error: 'Only the creator can delete the club.' });

    await club.deleteOne();
    res.json({ message: 'Club deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join a club (request approval)
router.post('/:id/join', async (req, res) => {
  const { email } = req.body;
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    // Add to joinRequests if not already a member or already requested
    if (!club.members.includes(email) && !club.joinRequests.includes(email)) {
      club.joinRequests.push(email);
      await club.save();
    }

    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve a join request
router.post('/:id/approve', async (req, res) => {
  const { email } = req.body;
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    if (club.joinRequests.includes(email)) {
      // Remove from joinRequests
      club.joinRequests = club.joinRequests.filter(e => e !== email);
      // Add to members
      club.members.push(email);
      await club.save();
    }

    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a message
router.post('/:id/message', async (req, res) => {
  const { user, text } = req.body;
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    club.messages.push({ user, text, createdAt: new Date() });
    await club.save();

    // Return club with messages sorted
    const sortedClub = {
      ...club.toObject(),
      messages: club.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    };

    res.json(sortedClub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a poll
router.post('/:id/polls', async (req, res) => {
  const { question, options } = req.body;
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const poll = {
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      voters: [],
      createdAt: new Date()
    };

    club.polls.push(poll);
    await club.save();
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote on a poll
router.post('/:id/polls/:pollId/vote', async (req, res) => {
  const { optionIndex, voter } = req.body;
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const poll = club.polls.id(req.params.pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    if (poll.voters.includes(voter))
      return res.status(400).json({ error: 'You have already voted' });

    poll.options[optionIndex].votes += 1;
    poll.voters.push(voter);

    await club.save();
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
