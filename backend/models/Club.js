// backend/models/Club.js

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [pollOptionSchema],
  voters: [String],
  createdAt: { type: Date, default: Date.now }
});

const ClubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  members: [String],       // approved members
  joinRequests: [String],  // pending join requests
  messages: [messageSchema],
  polls: [pollSchema]
});

module.exports = mongoose.model('Club', ClubSchema); // <-- Fixed here
