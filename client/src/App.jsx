import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import ActivityLog from './pages/ActivityLog';
import ToastContainer from './components/ui/Toast';
import Spinner from './components/ui/Spinner';
import useAuthStore from './context/AuthContext';
import useUIStore from './context/ThemeContext';
import useSocket from './hooks/useSocket';

// Auth guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Socket initializer component
const SocketInit = () => {
  useSocket();
  return null;
};

// Main routes component
const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// App initializer
const AppInit = () => {
  const { isAuthenticated, fetchMe } = useAuthStore();
  const token = localStorage.getItem('void_access_token');

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, []);

  return null;
};

function App() {
  const { theme, themeFlash } = useUIStore();

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        useUIStore.getState().toggleTheme();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`app-root min-h-screen theme-transition ${themeFlash ? 'theme-flash' : ''}`} data-theme={theme}>
      <BrowserRouter>
        <AppInit />
        <SocketInit />
        <AppRoutes />
        <ToastContainer />
      </BrowserRouter>
    </div>
  );
}

export default App;
