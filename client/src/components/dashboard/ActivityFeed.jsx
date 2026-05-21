import { motion, AnimatePresence } from 'framer-motion';
import { formatRelative, actionIcons, getInitials } from '../../utils/helpers';
import { slideInRight } from '../../utils/animations';

const ActivityFeed = ({ logs = [], maxItems = 8 }) => {
  const displayed = logs.slice(0, maxItems);

  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-orbitron tracking-widest text-void-cyan/70 mb-4 uppercase">
        ◈ Activity Feed
      </h3>
      {displayed.length === 0 ? (
        <p className="text-white/30 text-sm font-inter text-center py-6">No activity yet</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence>
            {displayed.map((log) => (
              <motion.div
                key={log._id}
                variants={slideInRight}
                initial="initial"
                animate="animate"
                className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0"
              >
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-orbitron font-bold text-void-black mt-0.5"
                  style={{ background: log.userId?.avatarColor || '#00F5FF' }}
                >
                  {getInitials(log.userId?.username || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 font-inter leading-snug">
                    <span className="text-void-cyan mr-1">{actionIcons[log.action]}</span>
                    {log.details}
                  </p>
                  <p className="text-[10px] text-white/30 font-inter mt-0.5">
                    {formatRelative(log.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
