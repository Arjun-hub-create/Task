import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import useUIStore from '../../context/ThemeContext';
import { slideInRight } from '../../utils/animations';

const toastIcons = {
  success: <CheckCircle size={16} className="text-void-green" />,
  error: <AlertTriangle size={16} className="text-void-crimson" />,
  info: <Radio size={16} className="text-void-cyan" />,
  warning: <AlertTriangle size={16} className="text-orange-400" />,
};

const toastColors = {
  success: 'border-void-green/30',
  error: 'border-void-crimson/30',
  info: 'border-void-cyan/30',
  warning: 'border-orange-400/30',
};

const Toast = ({ toast }) => {
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <motion.div
      variants={slideInRight}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex items-start gap-3 glass-card p-3.5 min-w-[280px] max-w-sm cursor-pointer border ${toastColors[toast.type] || 'border-void-cyan/20'}`}
      style={{ background: 'rgba(2,4,8,0.95)' }}
      onClick={() => removeToast(toast.id)}
    >
      <div className="mt-0.5 flex-shrink-0">{toastIcons[toast.type] || toastIcons.info}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-orbitron tracking-wider text-white/70 mb-0.5">{toast.title}</p>
        <p className="text-sm text-white/90 font-inter leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
        className="text-white/30 hover:text-white/70 flex-shrink-0 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
