const express = require('express');
const auth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Helper: Smart local fallback for subtasks based on keywords in the goal
function generateLocalSubtasks(goal) {
  const query = goal.toLowerCase();
  if (query.includes('learn') || query.includes('study') || query.includes('course')) {
    return [
      `Research fundamental concepts of ${goal}`,
      `Watch introductory tutorials and take structured notes`,
      `Complete 2-3 practical exercises or challenges`,
      `Build a small test project to apply the knowledge`,
      `Review core topics and identify areas for deeper study`
    ];
  } else if (query.includes('build') || query.includes('create') || query.includes('develop') || query.includes('code') || query.includes('make')) {
    return [
      `Outline architecture, requirements, and tech stack for ${goal}`,
      `Initialize directory structure and install essential dependencies`,
      `Implement core data models and basic backend routes`,
      `Design and build responsive frontend user interfaces`,
      `Conduct manual testing, patch errors, and deploy app`
    ];
  } else if (query.includes('clean') || query.includes('organize') || query.includes('fix') || query.includes('repair')) {
    return [
      `Inspect and list current items/issues needing attention`,
      `Gather cleaning/repair tools and clear working space`,
      `Systematically execute sorting or physical tasks`,
      `Dispose of waste and put items back in designated slots`,
      `Evaluate space/repair quality and establish keeping guidelines`
    ];
  }
  return [
    `Outline core steps and milestones for: ${goal}`,
    `Prepare required resources and schedule dedicated time`,
    `Complete first phase of execution`,
    `Review progress and make necessary adjustments`,
    `Verify quality of final output`
  ];
}

// Smart breakdown using Gemini, OpenAI, or Local fallback
router.post('/breakdown', auth, async (req, res) => {
  const { goal } = req.body;
  if (!goal) return res.status(400).json({ msg: 'Goal is required' });

  // 1. Try Gemini if configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Break down the goal: "${goal}" into 3-5 actionable subtasks. Return ONLY a valid JSON array of strings, with no markdown styling, no backticks, and no explanation. Example format: ["Task 1", "Task 2"]`
                }
              ]
            }
          ]
        }
      );
      const text = response.data.candidates[0].content.parts[0].text.trim();
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const subtasks = JSON.parse(cleaned);
      if (Array.isArray(subtasks) && subtasks.length > 0) {
        return res.json({ subtasks });
      }
    } catch (e) {
      console.warn('Gemini breakdown failed, trying OpenAI or fallback...', e.message);
    }
  }

  // 2. Try OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You break down a learning or productivity goal into 3-5 actionable subtasks. Return only a raw JSON array of strings.' },
          { role: 'user', content: `Break down: "${goal}"` }
        ],
        temperature: 0.7
      }, {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      });

      const content = response.data.choices[0].message.content.trim();
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const subtasks = JSON.parse(cleaned);
      if (Array.isArray(subtasks) && subtasks.length > 0) {
        return res.json({ subtasks });
      }
    } catch (e) {
      console.warn('OpenAI breakdown failed, running local generator...', e.message);
    }
  }

  // 3. Run smart local generator
  const subtasks = generateLocalSubtasks(goal);
  res.json({ subtasks });
});

// Priority suggestion
router.post('/prioritize', auth, async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ msg: 'No tasks provided' });
    }

    // Prepare context for AI
    const taskList = tasks.map((t, idx) => 
      `${idx+1}. Title: "${t.title}" | Priority: ${t.priority} | Due: ${t.dueDate ? new Date(t.dueDate).toDateString() : 'No due date'} | ${t.completed ? 'Completed' : 'Pending'}`
    ).join('\n');

    const prompt = `You are an AI productivity assistant. Given the following tasks, reorder them by true urgency and importance (Eisenhower matrix style). Return ONLY a JSON array of task IDs (the original numbers as strings) in the recommended order. Do not include any other text or markdown tags. Tasks:\n${taskList}`;

    let orderedIds;
    // Try OpenAI first, fallback to Gemini, then heuristic
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('No OpenAI API key configured');
      }
      const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You output only JSON arrays of numbers.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      }, {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      });
      const raw = openaiResponse.data.choices[0].message.content.trim();
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      orderedIds = JSON.parse(cleaned);
    } catch (openaiErr) {
      console.log('OpenAI failed or not configured, trying Gemini...', openaiErr.message);
      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('No Gemini API key configured');
        }
        // Gemini fallback (using gemini-2.5-flash)
        const geminiResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          contents: [{ parts: [{ text: prompt }] }]
        });
        const geminiText = geminiResponse.data.candidates[0].content.parts[0].text.trim();
        const cleaned = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
        orderedIds = JSON.parse(cleaned);
      } catch (geminiErr) {
        console.log('Gemini failed or not configured, throwing to local heuristic...', geminiErr.message);
        throw new Error('All AI providers failed');
      }
    }

    // Map back to actual MongoDB _id
    const idMap = tasks.reduce((acc, t, idx) => {
      acc[idx+1] = t.id || t._id;
      return acc;
    }, {});
    const finalOrder = orderedIds.map(num => idMap[num]).filter(id => id);

    res.json({ orderedIds: finalOrder });
  } catch (err) {
    console.error('AI prioritize fallback to heuristic:', err.message);
    // Fallback heuristic (urgency score)
    const sorted = tasks.sort((a, b) => {
      const scoreA = (a.priority === 'high' ? 10 : a.priority === 'medium' ? 5 : 1) + 
                     (a.dueDate && new Date(a.dueDate) < new Date() ? 15 : 0);
      const scoreB = (b.priority === 'high' ? 10 : b.priority === 'medium' ? 5 : 1) + 
                     (b.dueDate && new Date(b.dueDate) < new Date() ? 15 : 0);
      return scoreB - scoreA;
    });
    res.json({ orderedIds: sorted.map(t => t.id || t._id) });
  }
});

module.exports = router;
