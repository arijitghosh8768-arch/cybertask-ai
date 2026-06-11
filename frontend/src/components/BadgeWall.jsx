import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function BadgeWall() {
  const [badges, setBadges] = useState([]);
  const { API_URL } = useAuth();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/badges`);
      setBadges(res.data);
    } catch (error) {
      console.error('Failed to load badges:', error);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-cyan-400" /> Medals & Achievement Nodes
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {badges.map(b => (
          <div 
            key={b._id} 
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition-all text-center relative group"
          >
            <div className="text-3xl mb-1.5 animate-bounce-slow">{b.badge?.icon || '🏅'}</div>
            <div className="text-[11px] font-black text-slate-100 uppercase tracking-wide truncate max-w-full">
              {b.badge?.name}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
              {b.badge?.description}
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-950 border border-slate-800 p-2 rounded text-[9px] text-slate-300 w-32 shadow-xl z-20">
              Earned on {new Date(b.earnedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {badges.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-slate-600" />
          <p className="uppercase tracking-wider font-semibold">No medals unlocked yet</p>
          <p className="text-[10px] text-slate-600">Complete tasks and keep streaks to unlock nodes</p>
        </div>
      )}
    </div>
  );
}
