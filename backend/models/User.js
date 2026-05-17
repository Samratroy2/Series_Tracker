// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String }, // 👈 To store uploaded file name
  otp: { type: String },
  otpExpires: { type: Date },
  location: { type: String },
  profilePhoto: { type: String }, // already used
});

module.exports = mongoose.model('User', userSchema);
