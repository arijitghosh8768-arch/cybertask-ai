const nodemailer = require('nodemailer');
const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendDailyDigest(userEmail, tasks) {
  const taskList = tasks.map(t => `- ${t.title} (due: ${t.dueDate ? new Date(t.dueDate).toDateString() : 'no due date'})`).join('\n');
  const mailOptions = {
    from: `"CyberTask AI" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Your Daily Task Summary',
    text: `Good morning!\n\nYou have ${tasks.length} pending tasks:\n${taskList || 'None! Great job.'}\n\nStay productive!`
  };
  await transporter.sendMail(mailOptions);
}

// Cron job: runs daily at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily digest email job...');
  try {
    const users = await User.find({ 'preferences.dailySummary': true });
    for (const user of users) {
      const pendingTasks = await Task.find({ user: user._id, completed: false });
      if (pendingTasks.length > 0) {
        await sendDailyDigest(user.email, pendingTasks);
      }
    }
  } catch (err) {
    console.error('Daily digest email error:', err);
  }
});

module.exports = { sendDailyDigest };
