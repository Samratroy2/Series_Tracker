// backend/index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ✅ Only declared once

const animeRoutes = require('./routes/anime');
const authRoutes = require('./routes/authRoutes');
const clubRoutes = require('./routes/clubs');
const messageRoutes = require('./routes/messageRoutes');
const pollRoutes = require('./routes/polls');
const userRoutes = require('./routes/userRoutes'); // ✅ Add this if you want profile editing

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/animeClubApp';

// Serve profile images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/anime', animeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/users', userRoutes); // ✅ Important for updateUser API

// Root
app.get('/', (req, res) => {
  res.send('✅ Anime Club API is running!');
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start Server
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
