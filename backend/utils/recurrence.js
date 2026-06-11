const cron = require('node-cron');
const Task = require('../models/Task');

// Run every hour to check for recurring tasks that need renewal
cron.schedule('0 * * * *', async () => {
  try {
    const completedRecurring = await Task.find({
      completed: true,
      recurrence: { $ne: 'none' },
      $or: [
        { lastRecurred: null },
        { lastRecurred: { $lt: new Date() } }
      ]
    });
    for (const task of completedRecurring) {
      // Calculate next due date
      const nextDue = calculateNextDueDate(task.dueDate || new Date(), task.recurrence);
      
      // Create a new task based on recurrence
      const newTask = new Task({
        user: task.user,
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        recurrence: task.recurrence,
        dueDate: nextDue
      });
      await newTask.save();
      
      // Update original task so it doesn't recur again
      task.lastRecurred = new Date();
      await task.save();
    }
  } catch (err) {
    console.error('Recurrence error:', err);
  }
});

function calculateNextDueDate(currentDue, recurrence) {
  const next = new Date(currentDue);
  if (recurrence === 'daily') next.setDate(next.getDate() + 1);
  else if (recurrence === 'weekly') next.setDate(next.getDate() + 7);
  else if (recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
  return next;
}

module.exports = { calculateNextDueDate };
