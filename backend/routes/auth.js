const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserBadge = require('../models/UserBadge');
const Badge = require('../models/Badge');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email: email.toLowerCase(), password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Set initial streak
    user.streak = 1;
    user.lastActiveDate = new Date();
    
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name, email: user.email, streak: user.streak } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Robust daily streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      const diffTime = today - lastActive;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
      // If diffDays is 0 (already logged in today), streak remains unchanged
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = new Date();
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, streak: user.streak } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { notificationsEnabled, reminderMinutes, dailySummary, reminderEmail } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    if (notificationsEnabled !== undefined) user.preferences.notificationsEnabled = notificationsEnabled;
    if (reminderMinutes !== undefined) user.preferences.reminderMinutes = reminderMinutes;
    if (dailySummary !== undefined) user.preferences.dailySummary = dailySummary;
    if (reminderEmail !== undefined) user.preferences.reminderEmail = reminderEmail;
    
    await user.save();
    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    res.json(user.preferences || { notificationsEnabled: true, reminderMinutes: 60, dailySummary: false, reminderEmail: "" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user badges
router.get('/badges', auth, async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.user.id }).populate('badge');
    res.json(userBadges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
