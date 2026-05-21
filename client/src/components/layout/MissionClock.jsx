import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

const MissionClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const localTime = time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
  const date = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="mission-clock hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border theme-border"
      title="Mission time (Local)"
    >
      <Radio size={12} className="text-void-cyan animate-pulse" />
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-orbitron tracking-widest theme-text-muted">MISSION TIME</span>
        <span className="text-xs font-orbitron text-void-cyan tracking-wider tabular-nums">{localTime}</span>
      </div>
      <span className="text-[10px] font-inter theme-text-muted border-l theme-border pl-2">{date}</span>
    </motion.div>
  );
};

export default MissionClock;
