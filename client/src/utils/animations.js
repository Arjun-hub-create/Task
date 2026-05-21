export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const floatVariants = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const burstVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

export const launchVariants = {
  exit: {
    y: -120,
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.5, ease: 'easeIn' },
  },
};

export const shatterVariants = {
  exit: {
    opacity: 0,
    scale: 0.8,
    filter: 'blur(8px)',
    transition: { duration: 0.4 },
  },
};

export const containerVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};

export const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const slideInRight = {
  initial: { x: 120, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: 120, opacity: 0, transition: { duration: 0.25 } },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};

export const draggingVariants = {
  dragging: {
    scale: 1.03,
    rotate: 1.5,
    boxShadow: '0 0 30px rgba(0,245,255,0.4), 0 20px 60px rgba(0,0,0,0.5)',
    zIndex: 9999,
  },
};
