import { format, formatDistanceToNow, isAfter } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatRelative = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return isAfter(new Date(), new Date(dueDate));
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
};

export const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export const statusColumns = [
  { id: 'todo', label: 'TODO', color: '#ffffff80' },
  { id: 'in-progress', label: 'IN PROGRESS', color: '#7B2FFF' },
  { id: 'review', label: 'REVIEW', color: '#FF9500' },
  { id: 'completed', label: 'COMPLETED', color: '#00FF88' },
];

export const actionIcons = {
  created: '✦',
  updated: '◈',
  deleted: '✕',
  status_changed: '⟳',
  assigned: '→',
  completed: '✓',
};

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
