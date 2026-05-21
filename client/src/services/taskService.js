import api from './api';

export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  updateOrder: (id, order, status) => api.patch(`/tasks/${id}/order`, { order, status }),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const activityService = {
  getAll: (params) => api.get('/activity', { params }),
  getByTask: (taskId) => api.get(`/activity/task/${taskId}`),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
};
