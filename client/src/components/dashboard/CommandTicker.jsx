import { motion } from 'framer-motion';
import useTaskStore from '../../context/TaskContext';

const CommandTicker = () => {
  const { tasks } = useTaskStore();

  const critical = tasks.filter((t) => t.priority === 'critical' && t.status !== 'completed').length;
  const active = tasks.filter((t) => t.status === 'in-progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;

  const items = [
    `◈ ${tasks.length} TOTAL MISSIONS`,
    `▸ ${active} IN PROGRESS`,
    `✓ ${completed} COMPLETED`,
    critical > 0 ? `⚠ ${critical} CRITICAL ALERT` : '◉ ALL SYSTEMS NOMINAL',
    'VOID COMMAND — REAL-TIME SYNC ACTIVE',
  ];

  const tickerText = items.join('   •   ');

  return (
    <div className="command-ticker mb-6 overflow-hidden rounded-lg border theme-border">
      <div className="flex items-center gap-2 px-3 py-2 theme-surface">
        <span className="text-[10px] font-orbitron text-void-crimson tracking-widest flex-shrink-0 animate-pulse">
          LIVE
        </span>
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          <span className="text-xs font-orbitron tracking-wider theme-text-muted px-4">
            {tickerText}
          </span>
          <span className="text-xs font-orbitron tracking-wider theme-text-muted px-4" aria-hidden>
            {tickerText}
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default CommandTicker;
