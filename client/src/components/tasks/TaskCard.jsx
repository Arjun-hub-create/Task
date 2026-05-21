import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, Eye, CheckCircle } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { formatDate, isOverdue, getInitials } from '../../utils/helpers';
import { burstVariants, launchVariants, shatterVariants } from '../../utils/animations';
import useAuthStore from '../../context/AuthContext';

const TaskCard = ({
  task,
  onDelete,
  onComplete,
  onView,
  isDragging = false,
  style = {},
  dragHandleProps = {},
}) => {
  const { user } = useAuthStore();
  const [exiting, setExiting] = useState(null); // 'delete' | 'complete'

  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  const handleComplete = async () => {
    setExiting('complete');
    await new Promise((r) => setTimeout(r, 200));
    onComplete?.(task._id);
  };

  const handleDelete = async () => {
    setExiting('delete');
    await new Promise((r) => setTimeout(r, 200));
    onDelete?.(task._id);
  };

  const exitVariant = exiting === 'complete' ? launchVariants.exit : shatterVariants.exit;

  return (
    <AnimatePresence>
      {!exiting || true ? (
        <motion.div
          layout
          variants={burstVariants}
          initial="initial"
          animate={exiting ? exitVariant : 'animate'}
          exit={exiting === 'complete' ? launchVariants.exit : shatterVariants.exit}
          whileHover={!isDragging ? {
            y: -3,
            boxShadow: '0 0 25px rgba(0,245,255,0.15), 0 10px 30px rgba(0,0,0,0.5)',
          } : {}}
          className={`glass-card holographic p-4 cursor-pointer relative overflow-hidden ${isDragging ? 'border-void-cyan/60 shadow-[0_0_30px_rgba(0,245,255,0.3)]' : ''}`}
          style={{
            ...style,
            transform: isDragging ? 'rotate(1.5deg) scale(1.03)' : undefined,
          }}
          {...dragHandleProps}
          onClick={() => onView?.(task._id)}
        >
          {/* Priority indicator strip */}
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg"
            style={{
              background:
                task.priority === 'critical'
                  ? '#FF2D55'
                  : task.priority === 'high'
                  ? '#FF9500'
                  : task.priority === 'medium'
                  ? '#00F5FF'
                  : '#00FF88',
              boxShadow: `0 0 8px ${task.priority === 'critical' ? '#FF2D55' : task.priority === 'high' ? '#FF9500' : '#00F5FF'}`,
            }}
          />

          <div className="pl-2">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-inter font-semibold text-white/90 leading-snug flex-1 min-w-0">
                {task.title}
              </h4>
              <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {task.status !== 'completed' && user?.role === 'user' && (
                  <button
                    onClick={handleComplete}
                    className="p-1 text-void-green/40 hover:text-void-green transition-colors"
                    title="Mark complete"
                  >
                    <CheckCircle size={14} />
                  </button>
                )}
                {user?.role === 'manager' && (
                  <button
                    onClick={handleDelete}
                    className="p-1 text-void-crimson/40 hover:text-void-crimson transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {task.description && (
              <p className="text-xs text-white/40 font-inter mb-2.5 line-clamp-2">{task.description}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <PriorityBadge priority={task.priority} />
              {task.tags?.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-full border border-void-purple/30 text-void-purple/70 font-inter"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              {/* Assignee */}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-orbitron font-bold text-void-black"
                  style={{ background: task.assignedTo?.avatarColor || '#00F5FF' }}
                >
                  {getInitials(task.assignedTo?.username || '?')}
                </div>
                <span className="text-[10px] text-white/40 font-inter">{task.assignedTo?.username}</span>
              </div>

              {/* Due date */}
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-[10px] font-inter ${overdue ? 'text-void-crimson' : 'text-white/30'}`}>
                  <Calendar size={10} />
                  {formatDate(task.dueDate)}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default TaskCard;
