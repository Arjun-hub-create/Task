import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Clock, AlertTriangle, BarChart3, Users } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import CommandTicker from '../components/dashboard/CommandTicker';
import useTaskStore from '../context/TaskContext';
import useAuthStore from '../context/AuthContext';
import { getGreeting, statusColumns } from '../utils/helpers';
import { containerVariants, cardVariants } from '../utils/animations';
import { isAfter } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { tasks, activity, fetchTasks, fetchActivity, fetchUsers } = useTaskStore();

  useEffect(() => {
    fetchTasks({ limit: 200 });
    fetchActivity({ limit: 30 });
    if (user?.role === 'manager') fetchUsers();
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const overdue = tasks.filter(
    (t) => t.dueDate && isAfter(new Date(), new Date(t.dueDate)) && t.status !== 'completed'
  ).length;

  const statsData = [
    { label: 'TOTAL MISSIONS', value: total, icon: BarChart3, color: '#00F5FF', delay: 0 },
    { label: 'COMPLETED', value: completed, icon: CheckSquare, color: '#00FF88', delay: 0.1 },
    { label: 'IN PROGRESS', value: inProgress, icon: Clock, color: '#7B2FFF', delay: 0.2 },
    { label: 'OVERDUE', value: overdue, icon: AlertTriangle, color: '#FF2D55', delay: 0.3 },
  ];

  const recentTasks = tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 5);

  return (
    <PageWrapper>
      {/* Welcome heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-orbitron font-black text-2xl md:text-3xl tracking-wider text-white mb-1">
          {getGreeting()},{' '}
          <span style={{ color: '#00F5FF', textShadow: '0 0 15px rgba(0,245,255,0.5)' }}>
            COMMANDER {user?.username?.toUpperCase()}
          </span>
        </h1>
        <p className="text-xs font-orbitron text-white/30 tracking-widest">
          VOID COMMAND CENTER — OPERATIONAL
        </p>
      </motion.div>

      <CommandTicker />

      {/* Stats row */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8"
      >
        {statsData.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini kanban overview */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-orbitron tracking-widest text-void-cyan/50 mb-3 uppercase">
            ◈ Mission Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statusColumns.map(({ id, label, color }) => {
              const count = tasks.filter((t) => t.status === id).length;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 text-center"
                  style={{ borderColor: `${color}20` }}
                >
                  <div
                    className="text-3xl font-orbitron font-black mb-1"
                    style={{ color, textShadow: `0 0 10px ${color}60` }}
                  >
                    {count}
                  </div>
                  <div className="text-[10px] font-orbitron tracking-widest text-white/40">
                    {label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Recent missions */}
          <div className="mt-5">
            <h2 className="text-xs font-orbitron tracking-widest text-void-cyan/50 mb-3 uppercase">
              ◈ Active Missions
            </h2>
            <div className="space-y-2">
              {recentTasks.length === 0 ? (
                <div className="glass-card p-6 text-center text-white/30 text-sm font-inter">
                  No active missions
                </div>
              ) : (
                recentTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card px-4 py-3 flex items-center gap-3"
                  >
                    <div
                      className="w-1.5 h-8 rounded-full flex-shrink-0"
                      style={{
                        background:
                          task.priority === 'critical' ? '#FF2D55' :
                          task.priority === 'high' ? '#FF9500' :
                          task.priority === 'medium' ? '#00F5FF' : '#00FF88',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 font-inter truncate">{task.title}</p>
                      <p className="text-[10px] text-white/30 font-inter">
                        {task.assignedTo?.username} · {task.status}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="text-xs font-orbitron tracking-widest text-void-cyan/50 mb-3 uppercase">
            ◈ Live Feed
          </h2>
          <ActivityFeed logs={activity} maxItems={10} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
