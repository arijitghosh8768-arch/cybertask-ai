const mongoose = require('mongoose');

const UserBadgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
  earnedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserBadge', UserBadgeSchema);
