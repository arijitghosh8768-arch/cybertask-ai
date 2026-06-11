import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Shield, Sun, Moon, Bell, Clock, Mail } from 'lucide-react';

export default function Settings() {
  const { user, API_URL } = useAuth();
  const { dark, toggle } = useTheme();
  const [prefs, setPrefs] = useState({
    notificationsEnabled: true,
    reminderMinutes: 60,
    dailySummary: false,
    reminderEmail: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/preferences`);
      setPrefs(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    try {
      await axios.put(`${API_URL}/auth/preferences`, updated);
      toast.success('Configuration updated');
    } catch (error) {
      toast.error('Failed to sync preferences');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest font-bold">Decrypting system configuration...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 overflow-hidden pb-12">
      {/* Background radial glows */}
      <div className="ambient-glow ambient-blue"></div>
      <div className="ambient-glow ambient-pink"></div>

      {/* Header Deck */}
      <header className="relative z-10 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl shadow-neon-blue">
            <Shield className="w-6 h-6 text-slate-950 font-extrabold" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent tracking-widest uppercase">
              CYBERTASK AI
            </h1>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">System Settings Terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggle}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:text-cyan-400 transition-all cursor-pointer"
            title="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-all mb-8"
        >
          <ArrowLeft size={14} /> Return to Dashboard
        </Link>

        <div className="glass-panel rounded-2xl border border-slate-800 p-6 md:p-8 space-y-8">
          <div>
            <h2 className="text-xl font-black tracking-wider text-slate-100 uppercase">System Settings</h2>
            <p className="text-xs text-slate-400 mt-1">Configure notification hooks and automated user report nodes</p>
          </div>

          <div className="divide-y divide-slate-800/60 space-y-6">
            {/* Toggle 1: Due Date Notifications */}
            <div className="flex justify-between items-center pt-6 first:pt-0">
              <div className="flex gap-4 items-start max-w-[70%]">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-1">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">Due Date Notifications</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Receive browser push warnings for tasks scheduled to expire today</p>
                </div>
              </div>
              <button
                onClick={() => updatePreference('notificationsEnabled', !prefs.notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all cursor-pointer ${
                  prefs.notificationsEnabled ? 'bg-cyan-500' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-all ${
                    prefs.notificationsEnabled ? 'translate-x-6 bg-slate-950' : 'translate-x-1 bg-slate-400'
                  }`} 
                />
              </button>
            </div>

            {/* Select 2: Reminder Before Due */}
            <div className="flex justify-between items-center pt-6">
              <div className="flex gap-4 items-start max-w-[70%]">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">Reminder Time Interval</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Determine how early the system triggers a warning notification</p>
                </div>
              </div>
              <select
                value={prefs.reminderMinutes}
                onChange={(e) => updatePreference('reminderMinutes', parseInt(e.target.value))}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-400 font-semibold cursor-pointer"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={1440}>1 day</option>
              </select>
            </div>

            {/* Toggle 3: Daily Summary Email */}
            <div className="flex justify-between items-center pt-6">
              <div className="flex gap-4 items-start max-w-[70%]">
                <div className="p-2.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 mt-1">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">Daily Summary Broadcasts</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Broadcast a summary logs message to your email account every morning</p>
                </div>
              </div>
              <button
                onClick={() => updatePreference('dailySummary', !prefs.dailySummary)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all cursor-pointer ${
                  prefs.dailySummary ? 'bg-fuchsia-500' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-all ${
                    prefs.dailySummary ? 'translate-x-6 bg-slate-950' : 'translate-x-1 bg-slate-400'
                  }`} 
                />
              </button>
            </div>

            {/* Input 4: Reminder Target Email */}
            <div className="flex flex-col md:flex-row justify-between md:items-center pt-6 gap-4">
              <div className="flex gap-4 items-start max-w-[70%]">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mt-1">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-200">Digest Target Email</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Specify the email address where task alerts and morning digests are sent</p>
                </div>
              </div>
              <input
                type="email"
                value={prefs.reminderEmail || ''}
                onChange={(e) => setPrefs({ ...prefs, reminderEmail: e.target.value })}
                onBlur={(e) => updatePreference('reminderEmail', e.target.value)}
                placeholder="system@domain.com"
                className="px-3.5 py-2 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-400 font-semibold w-full md:w-64 glass-input"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
