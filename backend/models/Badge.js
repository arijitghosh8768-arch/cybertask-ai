const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String, // emoji or URL
  condition: { type: String, enum: ['streak', 'tasks_completed', 'tasks_created'] },
  threshold: Number
});

module.exports = mongoose.model('Badge', BadgeSchema);
