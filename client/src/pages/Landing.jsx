import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StarField from '../components/StarField';

const OrbitRing = ({ size, duration, reverse = false, dotColor = '#00F5FF' }) => (
  <div
    className="absolute rounded-full border"
    style={{
      width: size,
      height: size,
      borderColor: 'rgba(0,245,255,0.15)',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      animation: `orbitRing ${duration}s linear infinite ${reverse ? 'reverse' : ''}`,
    }}
  >
    <div
      className="absolute w-2.5 h-2.5 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        background: dotColor,
        boxShadow: `0 0 8px ${dotColor}, 0 0 16px ${dotColor}`,
      }}
    />
  </div>
);

const LetterReveal = ({ text, className, delay = 0 }) => (
  <span className={className}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + i * 0.05, duration: 0.4 }}
        style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))}
  </span>
);

const FloatingShape = ({ style, children }) => (
  <motion.div
    animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
    className="absolute text-void-cyan/20 pointer-events-none"
    style={style}
  >
    {children}
  </motion.div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden theme-bg"
    >
      <StarField />

      {/* Floating geometric shapes */}
      <FloatingShape style={{ top: '15%', left: '10%', fontSize: 40 }}>⬡</FloatingShape>
      <FloatingShape style={{ top: '20%', right: '12%', fontSize: 30 }}>△</FloatingShape>
      <FloatingShape style={{ bottom: '20%', left: '8%', fontSize: 50 }}>◈</FloatingShape>
      <FloatingShape style={{ bottom: '25%', right: '10%', fontSize: 35 }}>⬢</FloatingShape>
      <FloatingShape style={{ top: '45%', left: '5%', fontSize: 25 }}>✦</FloatingShape>
      <FloatingShape style={{ top: '60%', right: '6%', fontSize: 28 }}>◇</FloatingShape>

      {/* Center content */}
      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Orbit rings around logo */}
        <div className="relative flex items-center justify-center mb-12" style={{ width: 320, height: 320 }}>
          <OrbitRing size={300} duration={10} dotColor="#00F5FF" />
          <OrbitRing size={230} duration={7} reverse dotColor="#7B2FFF" />
          <OrbitRing size={160} duration={5} dotColor="#00FF88" />

          {/* Glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              background: 'radial-gradient(circle, rgba(0,245,255,0.15), transparent 70%)',
            }}
          />

          {/* VOID Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="relative z-10 flex items-center justify-center w-24 h-24 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(123,47,255,0.2))',
              border: '2px solid rgba(0,245,255,0.4)',
              boxShadow: '0 0 30px rgba(0,245,255,0.3), 0 0 60px rgba(123,47,255,0.15), inset 0 0 20px rgba(0,245,255,0.05)',
            }}
          >
            <span
              className="font-orbitron font-black text-5xl"
              style={{
                color: '#00F5FF',
                textShadow: '0 0 20px #00F5FF, 0 0 40px rgba(0,245,255,0.5)',
              }}
            >
              V
            </span>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-orbitron font-black text-7xl md:text-8xl tracking-widest mb-3"
          style={{
            background: 'linear-gradient(135deg, #00F5FF, #7B2FFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.4))',
          }}
        >
          VOID
        </motion.h1>

        {/* Tagline */}
        <div className="mb-10 h-8">
          <LetterReveal
            text="MISSION CONTROL FOR YOUR TEAM"
            delay={1.2}
            className="font-orbitron text-sm tracking-[0.3em] text-white/50"
          />
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.6 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/signup')}
            className="px-8 py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-widest text-void-black btn-glow"
            style={{
              background: 'linear-gradient(135deg, #00F5FF, #7B2FFF)',
            }}
          >
            INITIATE SEQUENCE
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, borderColor: 'rgba(0,245,255,0.8)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-widest text-void-cyan border border-void-cyan/40 hover:bg-void-glass transition-all"
          >
            ACCESS TERMINAL
          </motion.button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 3, duration: 2, repeat: Infinity }}
          className="mt-16 text-[10px] font-orbitron tracking-widest text-white/20"
        >
          ▼ ENTER THE VOID ▼
        </motion.div>
      </div>

      <style>{`
        @keyframes orbitRing {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
