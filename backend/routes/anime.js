// backend/routes/anime.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Load dummy data
const dummyAnimePath = path.join(__dirname, '../data/dummyAnimeData.json');
const animeData = JSON.parse(fs.readFileSync(dummyAnimePath, 'utf-8'));

// GET all anime
router.get('/', (req, res) => {
  res.json(animeData);
});

module.exports = router;
