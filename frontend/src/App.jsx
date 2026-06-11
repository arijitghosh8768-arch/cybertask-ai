import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import SharedLists from './pages/SharedLists';

// Secure Private Route Guard Component
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs uppercase tracking-widest font-bold">Verifying authorization token...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/shared" 
              element={
                <PrivateRoute>
                  <SharedLists />
                </PrivateRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              },
            }} 
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
