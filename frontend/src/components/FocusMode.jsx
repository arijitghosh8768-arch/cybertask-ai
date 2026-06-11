import { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Shield, CheckCircle, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FocusMode({ tasks, toggleComplete, onExit }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            toast.success('Focus session complete! Take a break.');
            // Native browser notification if allowed
            if (Notification.permission === 'granted') {
              new Notification('Focus session complete!', { body: 'Time to take a break.' });
            }
            setMinutes(25);
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const activeTasks = tasks.filter(t => !t.completed).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 flex flex-col items-center justify-center text-slate-100 overflow-hidden font-sans select-none">
      {/* Background cyber ambient grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"></div>
      
      {/* Top Header details */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-cyan-400" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Distraction-Free Focus Protocol</span>
      </div>

      <button 
        onClick={onExit} 
        className="absolute top-6 right-6 p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer"
        title="Exit focus mode"
      >
        <X size={20} />
      </button>

      {/* Large Pomodoro Timer Display */}
      <div className="relative flex flex-col items-center justify-center text-center my-6 z-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400/70 mb-2">Focus Session Countdown</span>
        <div className="text-8xl md:text-9xl font-black font-mono bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tighter drop-shadow-[0_0_35px_rgba(0,240,255,0.15)]">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        
        {/* Timer HUD Controls */}
        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => setIsActive(!isActive)} 
            className={`flex items-center justify-center w-14 h-14 rounded-2xl font-bold uppercase transition-all duration-200 cursor-pointer ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-neon-amber' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-neon-blue'
            }`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={() => { setMinutes(25); setSeconds(0); setIsActive(false); }} 
            className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 hover:text-cyan-400 transition-all cursor-pointer"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Primary task checklist HUD */}
      <div className="w-full max-w-md px-6 mt-10 z-10">
        <div className="border-b border-slate-800 pb-2 mb-4 flex justify-between items-center">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Current Targets</h3>
          <span className="text-[10px] text-cyan-400 font-bold bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-500/20">
            {activeTasks.length} Pending
          </span>
        </div>
        
        {activeTasks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            All objective nodes complete.
          </div>
        ) : (
          <ul className="space-y-3">
            {activeTasks.map(task => (
              <li 
                key={task._id} 
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-all duration-150"
              >
                <button 
                  onClick={() => toggleComplete(task)}
                  className="text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
                >
                  <Circle className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-slate-200 flex-1 truncate">
                  {task.title}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-extrabold ${
                  task.priority === 'high' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                  task.priority === 'medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
