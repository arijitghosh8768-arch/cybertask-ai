import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Cpu, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      return toast.error('Please fill in all core credentials');
    }
    try {
      setLoading(true);
      await register(name, email, password);
      toast.success('Cybernetic ID registered successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create database node');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Background glow effects */}
      <div className="ambient-glow ambient-blue"></div>
      <div className="ambient-glow ambient-pink"></div>

      <div className="relative w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800 z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-fuchsia-500/10 rounded-xl mb-3 border border-fuchsia-500/20 text-fuchsia-400">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            REGISTER ID
          </h2>
          <p className="text-sm text-slate-400 mt-2">Sync credentials to CyberTask core</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Identity Call Sign
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 glass-input focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Agent Zero"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              User Core Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 glass-input focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="identity@netsec.org"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Secure Passphrase
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl text-slate-100 placeholder-slate-500 glass-input focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-950 bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-400 hover:to-cyan-300 active:scale-95 transition-all duration-150 shadow-neon-pink cursor-pointer mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Forge Connection
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Already synced?{' '}
          <Link
            to="/login"
            className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-all"
          >
            Terminal Login
          </Link>
        </div>
      </div>
    </div>
  );
}
