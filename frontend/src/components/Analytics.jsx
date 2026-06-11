import { Trophy, CheckSquare, Zap, Target, Activity } from 'lucide-react';

export default function Analytics({ tasks, user }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate priority split
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const highCompleted = tasks.filter(t => t.priority === 'high' && t.completed).length;
  const highPercentage = highPriority > 0 ? Math.round((highCompleted / highPriority) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Streak Dashboard Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 transition-all duration-300 hover:border-amber-500/30">
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
          <Zap className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Streak</span>
          <span className="text-2xl font-black text-white font-mono">{user?.streak || 0} Days</span>
        </div>
      </div>

      {/* Completion Dashboard Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 transition-all duration-300 hover:border-cyan-500/30">
        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
          <Target className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Completion Ratio</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white font-mono">{completionRate}%</span>
            <div className="flex-1 h-1.5 bg-slate-850 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-500" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks Dashboard Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 transition-all duration-300 hover:border-fuchsia-500/30">
        <div className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20 text-fuchsia-400">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Queue Size</span>
          <span className="text-2xl font-black text-white font-mono">{activeTasks} Active</span>
        </div>
      </div>

      {/* High Priority Dashboard Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4 transition-all duration-300 hover:border-rose-500/30">
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
          <Activity className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">High Priority</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white font-mono">{highCompleted}/{highPriority}</span>
            <div className="flex-1 h-1.5 bg-slate-850 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-400 transition-all duration-500" 
                style={{ width: `${highPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
