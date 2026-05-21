import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('void_access_token') || null,
  isAuthenticated: !!localStorage.getItem('void_access_token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(credentials);
      const { accessToken, user } = res.data;
      localStorage.setItem('void_access_token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  signup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.signup(data);
      const { accessToken, user } = res.data;
      localStorage.setItem('void_access_token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('void_access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const res = await authService.getMe();
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('void_access_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
