import { useEffect } from 'react';
import { motion } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskFilters from '../components/tasks/TaskFilters';
import Spinner from '../components/ui/Spinner';
import useTaskStore from '../context/TaskContext';
import useAuthStore from '../context/AuthContext';
import { pageVariants } from '../utils/animations';

const Tasks = () => {
  const { tasks, loading, filters, fetchTasks, fetchUsers } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks({ limit: 200 });
    if (user?.role === 'manager') fetchUsers();
  }, [filters]);

  return (
    <PageWrapper>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <div className="mb-6">
          <h1 className="font-orbitron font-black text-2xl tracking-wider text-white mb-1">
            ◈ MISSION BOARD
          </h1>
          <p className="text-xs font-orbitron text-white/30 tracking-widest">
            DRAG CARDS ACROSS COLUMNS TO UPDATE STATUS
          </p>
        </div>

        <TaskFilters />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : (
          <TaskBoard tasks={tasks} onRefresh={() => fetchTasks({ limit: 200 })} />
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default Tasks;
