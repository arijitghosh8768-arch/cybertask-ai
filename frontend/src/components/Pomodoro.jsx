import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Coffee, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  
  const totalDuration = mode === 'focus' ? 25 * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progressPercent = ((totalDuration - currentSeconds) / totalDuration) * 100;

  // Web Audio synth completion chime
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Note 1
      let osc1 = audioCtx.createOscillator();
      let gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.5);

      // Note 2
      setTimeout(() => {
        let osc2 = audioCtx.createOscillator();
        let gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
        gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.5);
      }, 150);

      // Note 3
      setTimeout(() => {
        let osc3 = audioCtx.createOscillator();
        let gain3 = audioCtx.createGain();
        osc3.connect(gain3);
        gain3.connect(audioCtx.destination);
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(783.99, audioCtx.currentTime); // G5
        gain3.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc3.start();
        osc3.stop(audioCtx.currentTime + 0.8);
      }, 300);
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            playChime();
            if (mode === 'focus') {
              toast.success('Focus session complete! Take a break.');
              setMode('break');
              setMinutes(5);
            } else {
              toast.success('Break over! Time to get back to work.');
              setMode('focus');
              setMinutes(25);
            }
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };

  const setTimerMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden transition-all duration-300">
      {/* HUD Scanner lines/glows */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Target className="w-4 h-4 animate-spin-slow" />
          Neural Chronometer
        </h3>
        
        <div className="flex gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setTimerMode('focus')}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              mode === 'focus'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => setTimerMode('break')}
            className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded transition-all cursor-pointer ${
              mode === 'break'
                ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Break
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center my-6">
        {/* Circular Progress HUD */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="rgba(30, 41, 59, 0.6)"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Active Progress */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke={mode === 'focus' ? '#00f0ff' : '#ff007f'}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="276.46"
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              style={{
                filter: mode === 'focus' ? 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.6))' : 'drop-shadow(0 0 4px rgba(255, 0, 127, 0.6))'
              }}
            />
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${
              mode === 'focus' ? 'text-cyan-400' : 'text-fuchsia-400'
            }`}>
              {mode === 'focus' ? 'Tactical Lock' : 'Cooling Down'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer ${
            isActive
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : mode === 'focus'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-neon-blue'
                : 'bg-fuchsia-500 text-slate-950 font-black shadow-neon-pink'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Start
            </>
          )}
        </button>

        <button
          onClick={resetTimer}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-slate-300 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:text-white transition-all duration-150 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
