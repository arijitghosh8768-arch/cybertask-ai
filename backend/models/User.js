const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  preferences: {
    notificationsEnabled: { type: Boolean, default: true },
    reminderMinutes: { type: Number, default: 60 },
    dailySummary: { type: Boolean, default: false },
    reminderEmail: { type: String, default: "" }
  }
});

module.exports = mongoose.model('User', UserSchema);
