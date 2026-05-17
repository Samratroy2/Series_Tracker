// backend/routes/polls.js

const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

// Create poll
router.post('/:clubId/polls', async (req, res) => {
  const { question, options } = req.body;
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    if (!club.polls) club.polls = [];

    const poll = {
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })), // expect array of strings
      voters: [],
      createdAt: new Date()
    };

    club.polls.push(poll);
    await club.save();

    res.json(club); // return full club
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote on poll
router.post('/:clubId/polls/:pollId/vote', async (req, res) => {
  const { optionIndex, voter } = req.body;
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const poll = club.polls.id(req.params.pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    if (!poll.voters) poll.voters = [];
    if (poll.voters.includes(voter))
      return res.status(400).json({ error: 'You have already voted' });

    poll.options[optionIndex].votes += 1;
    poll.voters.push(voter);

    await club.save();
    res.json(club); // return full club
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
