const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  category: { type: String, default: 'general' },
  order: { type: Number, default: 0 },
  subtasks: [{ title: String, completed: { type: Boolean, default: false } }],
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  lastRecurred: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 }, // in seconds
  lastStartTime: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
