import { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportData({ tasks }) {
  const [isOpen, setIsOpen] = useState(false);

  const exportCSV = () => {
    if (!tasks.length) {
      toast.error('No tasks to export');
      return;
    }
    const headers = ['Title', 'Description', 'Priority', 'Due Date', 'Status', 'Category', 'Created At'];
    const rows = tasks.map(task => [
      `"${(task.title || '').replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      task.priority,
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
      task.completed ? 'Completed' : 'Pending',
      task.category || 'general',
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybertask_export_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
    setIsOpen(false);
  };

  const exportJSON = () => {
    if (!tasks.length) {
      toast.error('No tasks to export');
      return;
    }
    const data = {
      exportDate: new Date().toISOString(),
      totalTasks: tasks.length,
      tasks: tasks.map(t => ({
        id: t._id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        dueDate: t.dueDate,
        completed: t.completed,
        category: t.category,
        subtasks: t.subtasks,
        createdAt: t.createdAt
      }))
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cybertask_export_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON exported successfully');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-xs font-bold uppercase cursor-pointer"
        title="Export tasks configuration data"
      >
        <Download size={14} /> Export
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-20">
            <button 
              onClick={exportCSV} 
              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase text-slate-300 hover:bg-slate-850 hover:text-cyan-400 transition-all cursor-pointer"
            >
              CSV format
            </button>
            <button 
              onClick={exportJSON} 
              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase text-slate-300 hover:bg-slate-850 hover:text-cyan-400 transition-all cursor-pointer"
            >
              JSON format
            </button>
          </div>
        </>
      )}
    </div>
  );
}
