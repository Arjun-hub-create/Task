const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-white/10 text-white/60 border-white/20',
    cyan: 'bg-void-cyan/10 text-void-cyan border-void-cyan/30',
    purple: 'bg-void-purple/10 text-void-purple border-void-purple/30',
    green: 'bg-void-green/10 text-void-green border-void-green/30',
    crimson: 'bg-void-crimson/10 text-void-crimson border-void-crimson/30',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-orbitron border tracking-wider ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    low: 'green',
    medium: 'cyan',
    high: 'orange',
    critical: 'crimson',
  };
  return <Badge variant={map[priority] || 'default'}>{priority?.toUpperCase()}</Badge>;
};

export const StatusBadge = ({ status }) => {
  const map = {
    todo: 'default',
    'in-progress': 'purple',
    review: 'orange',
    completed: 'green',
  };
  const labels = {
    todo: 'TODO',
    'in-progress': 'IN PROGRESS',
    review: 'REVIEW',
    completed: 'COMPLETED',
  };
  return <Badge variant={map[status] || 'default'}>{labels[status] || status}</Badge>;
};

export default Badge;
