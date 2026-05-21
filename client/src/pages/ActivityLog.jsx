import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import Spinner from '../components/ui/Spinner';
import Select from '../components/ui/Select';
import useTaskStore from '../context/TaskContext';
import { formatRelative, actionIcons, getInitials } from '../utils/helpers';
import { slideInRight } from '../utils/animations';
import { activityService } from '../services/taskService';

const actionColors = {
  created: '#00F5FF',
  updated: '#7B2FFF',
  deleted: '#FF2D55',
  status_changed: '#FF9500',
  assigned: '#00F5FF',
  completed: '#00FF88',
};

const ActivityLog = () => {
  const { activity, fetchActivity } = useTaskStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadActivity = async (p = 1, action = '') => {
    setLoading(true);
    try {
      const res = await activityService.getAll({ page: p, limit: 20, ...(action ? { action } : {}) });
      useTaskStore.setState({ activity: res.data.logs });
      setTotalPages(res.data.totalPages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadActivity(page, filter);
  }, [page, filter]);

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-orbitron font-black text-2xl tracking-wider text-white mb-1">
            ◈ ACTIVITY LOG
          </h1>
          <p className="text-xs font-orbitron text-white/30 tracking-widest">
            REAL-TIME MISSION ACTIVITY TRACKING
          </p>
        </div>
        <Select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="w-auto min-w-[180px]"
        >
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="status_changed">Status Changed</option>
          <option value="completed">Completed</option>
          <option value="assigned">Assigned</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence>
              {activity.map((log, i) => (
                <motion.div
                  key={log._id}
                  variants={slideInRight}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.03 }}
                  className="glass-card px-5 py-4 flex items-center gap-4"
                >
                  {/* Action icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-lg border"
                    style={{
                      color: actionColors[log.action] || '#00F5FF',
                      borderColor: `${actionColors[log.action]}30` || 'rgba(0,245,255,0.2)',
                      background: `${actionColors[log.action]}10` || 'rgba(0,245,255,0.05)',
                    }}
                  >
                    {actionIcons[log.action] || '◈'}
                  </div>

                  {/* User avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-orbitron font-bold text-void-black"
                    style={{ background: log.userId?.avatarColor || '#00F5FF' }}
                  >
                    {getInitials(log.userId?.username || '?')}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-inter">{log.details}</p>
                    {log.taskId && (
                      <p className="text-[11px] text-void-cyan/50 font-inter truncate">
                        Task: {log.taskId?.title || log.taskId}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-white/30 font-inter">{formatRelative(log.timestamp)}</p>
                    <p
                      className="text-[10px] font-orbitron tracking-wider mt-0.5"
                      style={{ color: actionColors[log.action] || '#00F5FF' }}
                    >
                      {log.action?.toUpperCase().replace('_', ' ')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {activity.length === 0 && (
              <div className="glass-card p-12 text-center text-white/30 font-orbitron tracking-widest">
                NO ACTIVITY RECORDED
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-void-cyan/20 text-void-cyan/60 hover:text-void-cyan hover:border-void-cyan/40 disabled:opacity-30 font-orbitron text-xs tracking-wider transition-all"
              >
                PREV
              </button>
              <span className="text-xs font-orbitron text-white/40">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-void-cyan/20 text-void-cyan/60 hover:text-void-cyan hover:border-void-cyan/40 disabled:opacity-30 font-orbitron text-xs tracking-wider transition-all"
              >
                NEXT
              </button>
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
};

export default ActivityLog;
