import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { scaleIn } from '../../utils/animations';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-full ${sizes[size]} glass-card p-6 z-10`}
            style={{
              background: 'rgba(2,4,8,0.95)',
              border: '1px solid rgba(0,245,255,0.2)',
              boxShadow: '0 0 40px rgba(0,245,255,0.1), 0 25px 50px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-orbitron font-bold text-void-cyan tracking-wider">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/40 hover:text-void-cyan hover:bg-void-glass transition-all"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
