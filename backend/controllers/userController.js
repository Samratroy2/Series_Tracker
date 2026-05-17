// backend\controllers\userController.js

const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const updateUser = async (req, res) => {
  const { name, email, userId, password } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = name || user.name;
  user.email = email || user.email;
  user.userId = userId || user.userId;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  // ✅ Save uploaded image filename
  if (req.file) {
    user.profileImage = req.file.filename;
  }

  await user.save();
  res.json(user);
};


exports.deleteProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || !user.profileImage) return res.status(404).json({ error: 'No profile image found' });

    const filePath = path.join(__dirname, '../uploads', user.profileImage);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    user.profileImage = undefined;
    await user.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete profile image', details: err.message });
  }
};
