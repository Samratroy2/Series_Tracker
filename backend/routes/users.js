// backend\routes\users.js

let reminders = [
  { userId: 1, showId: 1, datetime: '2025-05-01T20:00:00', note: 'New episode release!' }
];

app.get('/api/users/:userId/reminders', (req, res) => {
  const { userId } = req.params;
  const userReminders = reminders.filter(r => r.userId == userId);
  res.json(userReminders);
});

app.post('/api/users/:userId/reminders', (req, res) => {
  const { userId } = req.params;
  const { showId, datetime, note } = req.body;
  const newReminder = { userId: parseInt(userId), showId, datetime, note };
  reminders.push(newReminder);
  res.json(newReminder);
});

let userWatchlists = {
  1: [1, 2],
  2: [3]
};

app.get('/api/users/:userId/watchlist', (req, res) => {
  const { userId } = req.params;
  const watchlist = userWatchlists[userId] || [];
  res.json(watchlist);
});

app.get('/api/share/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({ link: `http://localhost:3000/shared/${userId}` });
});
