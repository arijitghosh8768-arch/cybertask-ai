const express = require('express');
const router = express.Router();
const SharedList = require('../models/SharedList');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Create a shared list
router.post('/lists', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: 'List name is required' });
    const inviteToken = crypto.randomBytes(16).toString('hex');
    const list = new SharedList({ 
      owner: req.user.id, 
      name, 
      inviteToken, 
      members: [req.user.id] 
    });
    await list.save();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get all shared lists for user
router.get('/lists', auth, async (req, res) => {
  try {
    const lists = await SharedList.find({ members: req.user.id }).populate('tasks');
    res.json(lists);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add task to shared list
router.post('/lists/:listId/tasks', auth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ msg: 'Task title is required' });
    const list = await SharedList.findById(req.params.listId);
    if (!list || !list.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    const task = new Task({ user: req.user.id, title }); // task belongs to creator
    await task.save();
    list.tasks.push(task._id);
    await list.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Join via invite link
router.post('/join/:token', auth, async (req, res) => {
  try {
    const list = await SharedList.findOne({ inviteToken: req.params.token });
    if (!list) return res.status(404).json({ msg: 'Invalid invite' });
    if (!list.members.includes(req.user.id)) {
      list.members.push(req.user.id);
      await list.save();
    }
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
