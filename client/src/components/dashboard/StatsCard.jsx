import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { floatVariants } from '../../utils/animations';

const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

const StatsCard = ({ label, value, icon: Icon, color = '#00F5FF', delay = 0 }) => {
  const count = useCountUp(value);

  return (
    <motion.div
      variants={floatVariants}
      animate="animate"
      style={{ animationDelay: `${delay}s` }}
      className="glass-card holographic p-5 flex items-center gap-4"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={22} style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
      </div>
      <div>
        <p className="text-3xl font-orbitron font-black" style={{ color, textShadow: `0 0 10px ${color}80` }}>
          {count}
        </p>
        <p className="text-xs font-orbitron text-white/40 tracking-widest mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
