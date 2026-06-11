# CyberTask AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A smart productivity app for students, developers, and cybersecurity learners.**  
CyberTask AI combines task management with AI-powered prioritization, Pomodoro timer, progress analytics, and cloud sync.

## ✨ Features

- **User Authentication** – Signup/Login with JWT & bcrypt
- **Task Management** – Create, edit, delete, reorder (drag & drop)
- **Smart AI Prioritization** – Uses OpenAI/Gemini to reorder tasks by urgency
- **Calendar View** – See tasks by due date with interactive calendar
- **Progress Charts** – Visualize completion rates & daily activity (recharts)
- **Pomodoro Timer** – Built-in focus timer with notifications
- **Dark Mode** – Fully responsive dark/light theme
- **Push Notifications** – Due date reminders (browser)
- **Data Export** – Download tasks as CSV or JSON
- **Settings** – Configure notification preferences & daily summary
- **Recurring Tasks** – Automate repeat tasks daily, weekly, or monthly via node-cron scheduler
- **Interactive Search & Filter** – Search title matches and filter by priority, category, or status on both frontend and backend
- **Focus Mode Protocol** – Distraction-free full-screen overlay with a simplified Pomodoro timer and active targets checklist

## 🛠️ Tech Stack

| Layer       | Technologies                                                                 |
|-------------|------------------------------------------------------------------------------|
| Frontend    | React, Vite, Tailwind CSS, React Router, dnd-kit, recharts, react-calendar |
| Backend     | Node.js, Express, MongoDB, Mongoose                                          |
| Auth        | JWT, bcryptjs                                                                |
| AI          | OpenAI API / Gemini API                                                      |

## 🏗️ Architecture

```
Client (React) ↔ REST API (Express) ↔ MongoDB
                 ↳ OpenAI/Gemini API
```

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- OpenAI or Gemini API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # add your MONGO_URI, JWT_SECRET, OPENAI_API_KEY, GEMINI_API_KEY
npm run dev            # runs on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)

---

**Built with ❤️ for productivity learners**

# cybertask-ai
