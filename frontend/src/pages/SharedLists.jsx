import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Sun, Moon, Plus, UserPlus, Users, Link2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SharedLists() {
  const { user, API_URL } = useAuth();
  const { dark, toggle } = useTheme();

  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const res = await axios.get(`${API_URL}/shared/lists`);
      setLists(res.data);
    } catch (err) {
      toast.error('Failed to retrieve shared lists');
    }
  };

  const createList = async (e) => {
    if (e) e.preventDefault();
    if (!newListName.trim()) return toast.error('List name required');
    try {
      await axios.post(`${API_URL}/shared/lists`, { name: newListName });
      setNewListName('');
      fetchLists();
      toast.success('Shared objective network established');
    } catch (err) {
      toast.error('Failed to establish shared list');
    }
  };

  const joinList = async (e) => {
    if (e) e.preventDefault();
    if (!inviteToken.trim()) return toast.error('Invite token is required');
    try {
      await axios.post(`${API_URL}/shared/join/${inviteToken}`);
      setInviteToken('');
      fetchLists();
      toast.success('Successfully linked to list node');
    } catch (err) {
      toast.error('Failed to link: Invalid token');
    }
  };

  const addTaskToList = async (listId) => {
    const title = prompt('Enter task node title:');
    if (!title || !title.trim()) return;
    try {
      await axios.post(`${API_URL}/shared/lists/${listId}/tasks`, { title });
      fetchLists();
      toast.success('Task logged to list network');
    } catch (err) {
      toast.error('Failed to write task node');
    }
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    toast.success('Invite code copied to clipboard');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden pb-12">
      {/* Background radial glows */}
      <div className="ambient-glow ambient-blue"></div>
      <div className="ambient-glow ambient-pink"></div>

      {/* Header Deck */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl shadow-neon-blue">
            <Shield className="w-6 h-6 text-slate-950 font-extrabold" />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent tracking-widest uppercase">
              CYBERTASK AI
            </h1>
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Objective Collaboration Node</p>
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
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-all mb-8"
        >
          <ArrowLeft size={14} /> Return to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left panel: List Controls */}
          <div className="md:col-span-4 space-y-6">
            {/* Create lists panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Establish Network
              </h3>
              <form onSubmit={createList} className="space-y-3">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Network list name..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 glass-input text-xs"
                />
                <button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-neon-blue"
                >
                  Create List
                </button>
              </form>
            </div>

            {/* Join list panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-fuchsia-400 mb-3 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" /> Link Node Token
              </h3>
              <form onSubmit={joinList} className="space-y-3">
                <input
                  type="text"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Invite token code..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 glass-input text-xs"
                />
                <button
                  type="submit"
                  className="w-full bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-neon-pink"
                >
                  Link Network
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Lists listing */}
          <div className="md:col-span-8 space-y-6">
            {lists.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold uppercase tracking-wider">No active shared networks</p>
                <p className="text-xs text-slate-500 mt-1">Create or join lists using the controls panel</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {lists.map(list => (
                  <div key={list._id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-400" /> {list.name}
                        </h2>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Created by: {list.owner === user.id ? 'You' : 'Authorized User'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => copyToken(list.inviteToken)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all text-[10px] uppercase font-bold cursor-pointer"
                        title="Copy invite code"
                      >
                        <Copy size={10} /> Copy Code
                      </button>
                    </div>

                    <div className="border-t border-slate-900 pt-3">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Network Objectives</h4>
                      <ul className="space-y-2">
                        {list.tasks.map(task => (
                          <li key={task._id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/30 px-3 py-2 rounded-lg border border-slate-850">
                            <span>{task.title}</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded border uppercase font-extrabold ${
                              task.completed ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                            }`}>
                              {task.completed ? 'Complete' : 'Pending'}
                            </span>
                          </li>
                        ))}
                        {list.tasks.length === 0 && (
                          <p className="text-[10px] text-slate-500 italic">No tasks registered in this list</p>
                        )}
                      </ul>
                    </div>

                    <button
                      onClick={() => addTaskToList(list._id)}
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase transition-all pt-2 cursor-pointer"
                    >
                      <Plus size={14} /> Log List Task
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
