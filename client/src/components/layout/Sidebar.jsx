import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Activity, LogOut, User, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react';
import useAuthStore from '../../context/AuthContext';
import useUIStore from '../../context/ThemeContext';
import useToast from '../../hooks/useToast';
import { getInitials } from '../../utils/helpers';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'DASHBOARD' },
  { to: '/tasks', icon: CheckSquare, label: 'MISSIONS' },
  { to: '/activity', icon: Activity, label: 'ACTIVITY LOG' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Session terminated. Logging out of VOID.');
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="scanline-wrapper fixed left-0 top-0 h-screen z-40 flex flex-col theme-surface backdrop-blur-xl border-r theme-border"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-void-cyan/10">
        <div
          className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-orbitron font-black text-void-black text-sm"
          style={{
            background: 'linear-gradient(135deg, #00F5FF, #7B2FFF)',
            boxShadow: '0 0 15px rgba(0,245,255,0.4)',
          }}
        >
          V
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-orbitron font-black text-xl tracking-widest text-void-cyan whitespace-nowrap"
              style={{ textShadow: '0 0 10px rgba(0,245,255,0.5)' }}
            >
              VOID
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 flex flex-col gap-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-void-cyan/10 border border-void-cyan/25 text-void-cyan'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 ${isActive ? 'drop-shadow-[0_0_6px_#00F5FF]' : ''}`}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-orbitron tracking-wider whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-void-cyan/10 p-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-orbitron font-bold text-void-black"
              style={{ background: user.avatarColor || '#00F5FF' }}
            >
              {getInitials(user.username)}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-xs font-orbitron text-white/80 truncate">{user.username}</p>
                  <p className="text-[10px] text-void-cyan/60 font-inter">{user.role?.toUpperCase()}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-void-crimson/70 hover:text-void-crimson hover:bg-red-950/30 transition-all text-xs font-orbitron"
          >
            <LogOut size={15} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  EJECT
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-void-cyan theme-bg border border-void-cyan/30 hover:border-void-cyan/60 transition-all z-50"
        style={{ boxShadow: '0 0 10px rgba(0,245,255,0.2)' }}
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
