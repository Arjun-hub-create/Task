import { create } from 'zustand';
import { taskService, activityService, userService } from '../services/taskService';

const useTaskStore = create((set, get) => ({
  tasks: [],
  activity: [],
  users: [],
  loading: false,
  error: null,
  filters: { status: '', priority: '', assignedTo: '', search: '' },
  pagination: { page: 1, totalPages: 1, totalTasks: 0 },

  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await taskService.getAll({ ...get().filters, ...params });
      set({
        tasks: res.data.tasks,
        pagination: {
          page: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalTasks: res.data.totalTasks,
        },
        loading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load tasks', loading: false });
    }
  },

  createTask: async (data) => {
    try {
      const res = await taskService.create(data);
      set((state) => ({ tasks: [res.data.task, ...state.tasks] }));
      return { success: true, task: res.data.task };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create task' };
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await taskService.update(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data.task : t)),
      }));
      return { success: true, task: res.data.task };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update task' };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await taskService.updateStatus(id, status);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data.task : t)),
      }));
      return { success: true, task: res.data.task };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update status' };
    }
  },

  deleteTask: async (id) => {
    try {
      await taskService.delete(id);
      set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete task' };
    }
  },

  // Socket-driven updates
  socketAddTask: (task) => {
    set((state) => {
      const exists = state.tasks.find((t) => t._id === task._id);
      if (exists) return {};
      return { tasks: [task, ...state.tasks] };
    });
  },

  socketUpdateTask: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
    }));
  },

  socketDeleteTask: ({ taskId }) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) }));
  },

  fetchActivity: async (params = {}) => {
    try {
      const res = await activityService.getAll(params);
      set({ activity: res.data.logs });
    } catch {}
  },

  socketAddActivity: (log) => {
    set((state) => ({ activity: [log, ...state.activity].slice(0, 50) }));
  },

  fetchUsers: async () => {
    try {
      const res = await userService.getAll();
      set({ users: res.data.users });
    } catch {}
  },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  clearFilters: () => set({ filters: { status: '', priority: '', assignedTo: '', search: '' } }),
}));

export default useTaskStore;
