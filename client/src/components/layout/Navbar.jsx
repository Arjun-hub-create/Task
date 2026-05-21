import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useUIStore from '../../context/ThemeContext';
import useAuthStore from '../../context/AuthContext';
import { getGreeting } from '../../utils/helpers';
import MissionClock from './MissionClock';

const Navbar = () => {
  const { theme, toggleTheme } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b theme-border theme-surface backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="text-xs font-orbitron text-void-cyan/50 tracking-widest theme-text-muted">
          {getGreeting()}, COMMANDER
        </span>
        {user && (
          <span className="text-xs font-orbitron theme-text tracking-wider opacity-80">
            {user.username?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <MissionClock />
        {/* Connection status */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-void-green" style={{ boxShadow: '0 0 4px #00FF88', animation: 'pulse 2s infinite' }} />
          <span className="text-[10px] font-orbitron text-void-green/60 tracking-wider">ONLINE</span>
        </div>

        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 rounded-lg border transition-all ${
            theme === 'dark'
              ? 'text-void-cyan/80 hover:text-void-cyan bg-void-cyan/5 border-void-cyan/25 hover:border-void-cyan/50'
              : 'text-amber-500/90 hover:text-amber-400 bg-amber-400/10 border-amber-400/30 hover:border-amber-400/50'
          }`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (Ctrl+Shift+L)`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>
      </div>
    </header>
  );
};

export default Navbar;
