const Badge = require('../models/Badge');
const mongoose = require('mongoose');
require('dotenv').config();

const badges = [
  { name: 'Rising Star', description: 'Complete 10 tasks', condition: 'tasks_completed', threshold: 10, icon: '⭐' },
  { name: 'Task Master', description: 'Complete 50 tasks', condition: 'tasks_completed', threshold: 50, icon: '🏆' },
  { name: 'Streak Keeper', description: '7-day streak', condition: 'streak', threshold: 7, icon: '🔥' },
  { name: 'Marathoner', description: '30-day streak', condition: 'streak', threshold: 30, icon: '🏅' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Badge.deleteMany();
    await Badge.insertMany(badges);
    console.log('Badges seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
}
seed();
