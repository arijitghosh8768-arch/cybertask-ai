const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const { search, priority, status, category } = req.query;
    let filter = { user: req.user.id };
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }
    if (status === 'completed') {
      filter.completed = true;
    } else if (status === 'active') {
      filter.completed = false;
    }
    if (category && category !== 'all') {
      filter.category = { $regex: category, $options: 'i' };
    }

    const tasks = await Task.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, category, subtasks, recurrence } = req.body;
    const order = await Task.countDocuments({ user: req.user.id });
    const newTask = new Task({
      user: req.user.id,
      title,
      description,
      priority,
      dueDate,
      category,
      subtasks: subtasks || [],
      recurrence: recurrence || 'none',
      order
    });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed, category, subtasks, order, recurrence, lastRecurred } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority !== undefined ? priority : task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.completed = completed !== undefined ? completed : task.completed;
    task.category = category !== undefined ? category : task.category;
    task.subtasks = subtasks !== undefined ? subtasks : task.subtasks;
    task.order = order !== undefined ? order : task.order;
    task.recurrence = recurrence !== undefined ? recurrence : task.recurrence;
    task.lastRecurred = lastRecurred !== undefined ? lastRecurred : task.lastRecurred;

    await task.save();

    // Gamification award logic
    if (completed === true) {
      try {
        const user = await User.findById(req.user.id);
        const totalCompleted = await Task.countDocuments({ user: req.user.id, completed: true });
        const allBadges = await Badge.find();
        const earnedBadges = [];

        for (const badge of allBadges) {
          let achieved = false;
          if (badge.condition === 'tasks_completed' && totalCompleted >= badge.threshold) achieved = true;
          if (badge.condition === 'streak' && user.streak >= badge.threshold) achieved = true;
          if (achieved) {
            const already = await UserBadge.findOne({ user: user._id, badge: badge._id });
            if (!already) {
              await UserBadge.create({ user: user._id, badge: badge._id });
              earnedBadges.push(badge.name);
            }
          }
        }
        if (earnedBadges.length) {
          console.log(`User ${user.email} earned: ${earnedBadges.join(', ')}`);
        }
      } catch (err) {
        console.error('Failed to award badge:', err.message);
      }
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });
    await task.deleteOne();
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Start timer
router.post('/:id/start-timer', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) return res.status(404).json({ msg: 'Not found' });
    task.lastStartTime = new Date();
    await task.save();
    res.json({ msg: 'Timer started', lastStartTime: task.lastStartTime });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Stop timer and add elapsed time
router.post('/:id/stop-timer', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task || task.user.toString() !== req.user.id) return res.status(404).json({ msg: 'Not found' });
    if (task.lastStartTime) {
      const elapsed = Math.floor((new Date() - task.lastStartTime) / 1000);
      task.timeSpent += elapsed;
      task.lastStartTime = null;
      await task.save();
    }
    res.json({ timeSpent: task.timeSpent });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
