import { create } from 'zustand';

let toastId = 0;

const STORAGE_KEY = 'void_theme';

export const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
};

const getInitialTheme = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
};

// Apply before first paint when possible
if (typeof document !== 'undefined') {
  applyTheme(getInitialTheme());
}

const useUIStore = create((set, get) => ({
  theme: getInitialTheme(),
  sidebarOpen: true,
  activeModal: null,
  toasts: [],
  themeFlash: false,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next, themeFlash: true });
    setTimeout(() => set({ themeFlash: false }), 600);
    get().toast.info(
      next === 'light' ? 'Solar arrays online. Light mode active.' : 'Stealth mode engaged. Dark mode active.',
      'THEME SWITCH'
    );
  },

  setTheme: (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    applyTheme(theme);
    set({ theme });
  },

  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) => {
    const id = ++toastId;
    const newToast = { id, ...toast };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => get().removeToast(id), toast.duration || 4000);
    return id;
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  toast: {
    success: (message, title = 'TRANSMISSION') => {
      useUIStore.getState().addToast({ type: 'success', title, message });
    },
    error: (message, title = 'ALERT') => {
      useUIStore.getState().addToast({ type: 'error', title, message });
    },
    info: (message, title = 'SIGNAL') => {
      useUIStore.getState().addToast({ type: 'info', title, message });
    },
    warning: (message, title = 'WARNING') => {
      useUIStore.getState().addToast({ type: 'warning', title, message });
    },
  },
}));

export default useUIStore;
