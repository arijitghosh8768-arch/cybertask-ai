import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, Trash2, CheckCircle, Circle, LogOut, Sun, Moon, Sparkles, 
  Layers, AlertCircle, Calendar, Shield, Play, ChevronDown, ChevronUp, Star, Settings, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pomodoro from '../components/Pomodoro';
import Analytics from '../components/Analytics';
import ExportData from '../components/ExportData';
import FocusMode from '../components/FocusMode';
import BadgeWall from '../components/BadgeWall';

// Inline Sortable Task Item Component
function SortableTaskItem({ task, toggleComplete, toggleSubtask, deleteTask, triggerAI, selectTask, trackingTaskId, startTimer, stopTimer }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const [expanded, setExpanded] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto'
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`glass-panel rounded-xl p-4 transition-all hover:bg-slate-900/60 duration-200 border ${
        task.completed ? 'border-slate-800/40 opacity-70' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-1"
          title="Drag to reorder"
        >
          <Layers className="w-4 h-4" />
        </div>

        {/* Complete button */}
        <button 
          onClick={() => toggleComplete(task)}
          className="text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
        >
          {task.completed ? (
            <CheckCircle className="w-5 h-5 text-cyan-400" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content details */}
        <div className="flex-1 cursor-pointer" onClick={() => selectTask(task)}>
          <p className={`font-semibold text-sm transition-all ${
            task.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'
          }`}>
            {task.title}
          </p>
          <div className="flex flex-wrap gap-2 items-center mt-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getPriorityBadge(task.priority)}`}>
              {task.priority}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded border border-slate-800 bg-slate-950 text-slate-400">
              {task.category}
            </span>
            {task.dueDate && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <span className="text-[10px] text-cyan-400 font-bold">
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} Subtasks
              </span>
            )}
            {task.timeSpent > 0 && (
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                ⏱️ {Math.floor(task.timeSpent / 60)}m {task.timeSpent % 60}s
              </span>
            )}
          </div>
        </div>

        {/* Action tray */}
        <div className="flex items-center gap-2">
          {trackingTaskId === task._id ? (
            <button 
              onClick={(e) => { e.stopPropagation(); stopTimer(task._id); }} 
              className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded font-black hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Stop tracking time"
            >
              Stop ⏹️
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); startTimer(task._id); }} 
              className="text-[10px] text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-black hover:bg-emerald-500/20 transition-all cursor-pointer"
              title="Start tracking time"
            >
              Start ▶️
            </button>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          {!task.completed && (!task.subtasks || task.subtasks.length === 0) && (
            <button
              onClick={() => triggerAI(task)}
              className="p-1 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
              title="AI Breakdown"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => deleteTask(task._id)} 
            className="p-1 text-slate-500 hover:text-rose-500 transition-all cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded subtasks view */}
      {expanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pl-9 pr-2 py-2.5 border-t border-slate-800/40 space-y-2">
          {task.subtasks.map((sub, idx) => (
            <div key={sub._id || idx} className="flex items-center justify-between text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => toggleSubtask(task, idx)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                  {sub.title}
                </span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, API_URL } = useAuth();
  const { dark, toggle } = useTheme();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New task form fields
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newCategory, setNewCategory] = useState('general');
  const [newDueDate, setNewDueDate] = useState('');
  const [newRecurrence, setNewRecurrence] = useState('none');

  // Sidebar task detail view
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Search & Filter state
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'active' | 'completed'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [searchQuery, setSearchQuery] = useState('');

  // Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Time tracking state
  const [trackingTaskId, setTrackingTaskId] = useState(null);

  const startTimer = async (taskId) => {
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/start-timer`);
      setTrackingTaskId(taskId);
      toast.success('Time tracking protocol initialized');
    } catch (e) {
      toast.error('Failed to initialize timer');
    }
  };

  const stopTimer = async (taskId) => {
    try {
      await axios.post(`${API_URL}/tasks/${taskId}/stop-timer`);
      setTrackingTaskId(null);
      fetchTasks();
      toast.success('Time tracking logs synced');
    } catch (e) {
      toast.error('Failed to stop timer');
    }
  };
  
  // Setup sensors for DND
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: verticalListSortingStrategy })
  );

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, filterPriority, filterMode]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterPriority && filterPriority !== 'all') params.append('priority', filterPriority);
      if (filterMode && filterMode !== 'all') params.append('status', filterMode);

      const res = await axios.get(`${API_URL}/tasks?${params.toString()}`);
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to sync queue');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return toast.error('Task title required');

    try {
      const res = await axios.post(`${API_URL}/tasks`, {
        title: newTitle,
        priority: newPriority,
        category: newCategory,
        dueDate: newDueDate || undefined,
        recurrence: newRecurrence
      });
      setTasks([res.data, ...tasks]);
      setNewTitle('');
      setNewDueDate('');
      setNewRecurrence('none');
      toast.success('Task logged in system database');
    } catch (err) {
      toast.error('Failed to write task');
    }
  };

  const toggleComplete = async (task) => {
    try {
      const updated = { ...task, completed: !task.completed };
      // Optimistic update
      setTasks(tasks.map(t => t._id === task._id ? updated : t));
      if (selectedTask && selectedTask._id === task._id) {
        setSelectedTask(updated);
      }
      await axios.put(`${API_URL}/tasks/${task._id}`, { completed: updated.completed });
    } catch (err) {
      toast.error('Sync failure, reverting state');
      fetchTasks();
    }
  };

  const toggleSubtask = async (task, subIndex) => {
    try {
      const updatedSubtasks = [...task.subtasks];
      updatedSubtasks[subIndex].completed = !updatedSubtasks[subIndex].completed;
      const updated = { ...task, subtasks: updatedSubtasks };
      
      setTasks(tasks.map(t => t._id === task._id ? updated : t));
      if (selectedTask && selectedTask._id === task._id) {
        setSelectedTask(updated);
      }
      await axios.put(`${API_URL}/tasks/${task._id}`, { subtasks: updatedSubtasks });
    } catch (err) {
      toast.error('Failed to toggle subtask');
      fetchTasks();
    }
  };

  const deleteTask = async (id) => {
    try {
      setTasks(tasks.filter(t => t._id !== id));
      if (selectedTask && selectedTask._id === id) {
        setSelectedTask(null);
      }
      await axios.delete(`${API_URL}/tasks/${id}`);
      toast.success('Task removed');
    } catch (err) {
      toast.error('Failed to purge task node');
      fetchTasks();
    }
  };

  // AI Breakdown Trigger
  const triggerAI = async (task) => {
    const loadingToast = toast.loading('Consulting core intelligence...');
    try {
      const res = await axios.post(`${API_URL}/ai/breakdown`, { goal: task.title });
      const subtasksList = res.data.subtasks.map(title => ({ title, completed: false }));
      
      const updatedRes = await axios.put(`${API_URL}/tasks/${task._id}`, { subtasks: subtasksList });
      
      setTasks(tasks.map(t => t._id === task._id ? updatedRes.data : t));
      if (selectedTask && selectedTask._id === task._id) {
        setSelectedTask(updatedRes.data);
      }
      toast.dismiss(loadingToast);
      toast.success('Subtask breakdown initialized successfully');
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error('AI node communication timeout');
    }
  };

  // AI Prioritization Optimizer
  const triggerAIPrioritize = async () => {
    if (tasks.length <= 1) return toast.error('Add more tasks to run optimization');
    const loadingToast = toast.loading('Calculating tactical priority queue...');
    try {
      const reqTasks = tasks.map(t => ({ id: t._id, title: t.title, priority: t.priority, dueDate: t.dueDate }));
      const res = await axios.post(`${API_URL}/ai/prioritize`, { tasks: reqTasks });
      const { orderedIds } = res.data;

      // Sort current tasks array based on orderedIds mapping
      const sorted = [...tasks].sort((a, b) => {
        const indexA = orderedIds.indexOf(a._id);
        const indexB = orderedIds.indexOf(b._id);
        return (indexA !== -1 ? indexA : 999) - (indexB !== -1 ? indexB : 999);
      });

      setTasks(sorted);
      toast.dismiss(loadingToast);
      toast.success('Priority optimization complete');

      // Save new order to database
      for (let i = 0; i < sorted.length; i++) {
        await axios.put(`${API_URL}/tasks/${sorted[i]._id}`, { order: i });
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Priority sort optimization failed');
    }
  };

  // DND sorting handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t._id === active.id);
    const newIndex = tasks.findIndex(t => t._id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    
    setTasks(reordered);
    
    try {
      // Async update indexes to database
      for (let i = 0; i < reordered.length; i++) {
        axios.put(`${API_URL}/tasks/${reordered[i]._id}`, { order: i });
      }
    } catch (e) {
      toast.error('Order sync failed');
    }
  };

  // Filtering Logic (handled by backend query params)
  const filteredTasks = tasks;

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
            <p className="text-[10px] text-slate-400 uppercase font-semibold">User Terminal Config 2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-xs font-semibold text-slate-300">Agent: {user?.name}</span>
          </div>

          <button 
            onClick={toggle}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:text-cyan-400 transition-all cursor-pointer"
            title="Toggle color grid theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link 
            to="/shared"
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:text-cyan-400 transition-all flex items-center gap-2 text-xs font-bold uppercase cursor-pointer"
            title="Objective Collaboration Networks"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Shared</span>
          </Link>

          <Link 
            to="/settings"
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:text-cyan-400 transition-all flex items-center gap-2 text-xs font-bold uppercase cursor-pointer"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </Link>

          <button 
            onClick={logout}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:text-rose-400 transition-all flex items-center gap-2 text-xs font-bold uppercase cursor-pointer"
            title="De-authorize terminal"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Main Core Dashboard Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Statistics & Streaks Deck */}
        <Analytics tasks={tasks} user={user} />

        {/* Content Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Log Actions & Task Queue */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Create Task Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Log Objective Node
              </h3>
              
              <form onSubmit={createTask} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter objective title..."
                    className="flex-1 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 glass-input text-sm"
                  />
                  <button 
                    type="submit" 
                    className="bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider transition-all duration-150 shadow-neon-blue cursor-pointer"
                  >
                    Add Task
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-slate-300 bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Category</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g. work, personal"
                      className="w-full px-3 py-2 rounded-lg text-slate-300 bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-slate-300 bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Recurrence</label>
                    <select
                      value={newRecurrence}
                      onChange={(e) => setNewRecurrence(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-slate-300 bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="none">No repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Task Filters & Controller Panel */}
            <div className="glass-panel relative z-20 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {['all', 'active', 'completed'].map(m => (
                  <button
                    key={m}
                    onClick={() => setFilterMode(m)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      filterMode === m 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Search & Priority sorting */}
              <div className="flex w-full md:w-auto items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by keyword..."
                  className="px-3 py-1.5 text-xs rounded-lg glass-input w-full md:w-44 placeholder-slate-500"
                />

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <button
                  onClick={triggerAIPrioritize}
                  className="p-1.5 rounded-lg bg-purple-500 text-slate-950 font-black hover:bg-purple-400 transition-all flex items-center gap-1.5 text-xs uppercase cursor-pointer shadow-neon-pink"
                  title="Optimize order using smart weight scores"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Sort
                </button>

                <ExportData tasks={tasks} />

                <button
                  onClick={() => setIsFocusMode(true)}
                  className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-black hover:bg-cyan-400 transition-all flex items-center gap-1.5 text-xs uppercase cursor-pointer shadow-neon-blue"
                  title="Distraction-free Focus protocol"
                >
                  <Play size={12} /> Focus
                </button>
              </div>
            </div>

            {/* Task Item List Deck */}
            {loading && tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Decrypting secure files...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold uppercase tracking-wider">No active nodes registered</p>
                <p className="text-xs text-slate-500 mt-1">Configure inputs in dashboard creator panel</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {filteredTasks.map(task => (
                      <SortableTaskItem
                        key={task._id}
                        task={task}
                        toggleComplete={toggleComplete}
                        toggleSubtask={toggleSubtask}
                        deleteTask={deleteTask}
                        triggerAI={triggerAI}
                        selectTask={setSelectedTask}
                        trackingTaskId={trackingTaskId}
                        startTimer={startTimer}
                        stopTimer={stopTimer}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Right Column: Pomodoro HUD Timer & Node Inspector panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pomodoro module */}
            <Pomodoro />

            {/* Badge Wall */}
            <BadgeWall />

            {/* Selected Task Inspector Details */}
            {selectedTask ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="absolute top-4 right-4 text-xs font-bold uppercase text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Close [x]
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-400 mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4" /> Node Inspector
                </h3>

                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Title</span>
                    <p className="text-sm font-semibold text-slate-100">{selectedTask.title}</p>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority Rank</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${
                      selectedTask.priority === 'high' ? 'text-rose-400 border-rose-500/20' :
                      selectedTask.priority === 'medium' ? 'text-amber-400 border-amber-500/20' :
                      'text-emerald-400 border-emerald-500/20'
                    }`}>
                      {selectedTask.priority}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Description Logs</span>
                    <textarea
                      value={selectedTask.description || ''}
                      onChange={async (e) => {
                        const updated = { ...selectedTask, description: e.target.value };
                        setSelectedTask(updated);
                        setTasks(tasks.map(t => t._id === selectedTask._id ? updated : t));
                        await axios.put(`${API_URL}/tasks/${selectedTask._id}`, { description: e.target.value });
                      }}
                      placeholder="Add details, logs, or system instructions..."
                      className="w-full h-24 p-3 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center py-10 text-slate-500">
                <p className="text-xs uppercase tracking-wider font-semibold">No node selected for inspector</p>
                <p className="text-[10px] text-slate-600 mt-1">Click on a task title to inspect detailed nodes</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {isFocusMode && (
        <FocusMode 
          tasks={tasks} 
          toggleComplete={toggleComplete} 
          onExit={() => {
            setIsFocusMode(false);
            fetchTasks();
          }} 
        />
      )}
    </div>
  );
}
