import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../context/AuthContext';
import useTaskStore from '../context/TaskContext';

let socketInstance = null;

const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { socketAddTask, socketUpdateTask, socketDeleteTask, socketAddActivity } = useTaskStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user || initialized.current) return;

    socketInstance = io(window.location.origin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected');
      socketInstance.emit('join:workspace', user._id);
    });

    socketInstance.on('task:created', (task) => {
      socketAddTask(task);
    });

    socketInstance.on('task:updated', (task) => {
      socketUpdateTask(task);
    });

    socketInstance.on('task:deleted', (data) => {
      socketDeleteTask(data);
    });

    socketInstance.on('task:status', ({ task }) => {
      if (task) socketUpdateTask(task);
    });

    socketInstance.on('activity:new', (log) => {
      socketAddActivity(log);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    initialized.current = true;

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        initialized.current = false;
      }
    };
  }, [isAuthenticated, user]);

  return socketInstance;
};

export default useSocket;
