import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import StarField from '../components/StarField';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../context/AuthContext';
import useToast from '../hooks/useToast';
import { pageVariants } from '../utils/animations';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      toast.success('Welcome back, Commander.', 'ACCESS GRANTED');
      navigate('/dashboard');
    } else {
      setShake(true);
      toast.error(result.message, 'ACCESS DENIED');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden theme-bg">
      <StarField />

      {/* Left visual panel */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="hidden lg:flex flex-1 items-center justify-center relative z-10"
      >
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-8" style={{ width: 220, height: 220 }}>
            {[180, 140, 100].map((size, i) => (
              <div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: size, height: size,
                  borderColor: i === 0 ? 'rgba(0,245,255,0.15)' : i === 1 ? 'rgba(123,47,255,0.2)' : 'rgba(0,255,136,0.15)',
                  animation: `orbitRing ${8 - i * 2}s linear infinite ${i % 2 ? 'reverse' : ''}`,
                }}
              >
                <div className="absolute w-2 h-2 rounded-full top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ background: i === 0 ? '#00F5FF' : i === 1 ? '#7B2FFF' : '#00FF88', boxShadow: `0 0 6px ${i === 0 ? '#00F5FF' : i === 1 ? '#7B2FFF' : '#00FF88'}` }} />
              </div>
            ))}
            <span className="font-orbitron font-black text-5xl z-10"
              style={{ color: '#00F5FF', textShadow: '0 0 20px #00F5FF' }}>V</span>
          </div>
          <h2 className="font-orbitron font-black text-4xl tracking-widest mb-2"
            style={{ background: 'linear-gradient(135deg,#00F5FF,#7B2FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VOID
          </h2>
          <p className="font-orbitron text-xs tracking-[0.3em] text-white/30">SPACE COMMAND CENTER</p>
        </div>
        <style>{`@keyframes orbitRing { from{transform:translate(-50%,-50%) rotate(0deg)} to{transform:translate(-50%,-50%) rotate(360deg)} }`}</style>
      </motion.div>

      {/* Right form panel */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="flex-1 lg:max-w-md flex items-center justify-center p-8 relative z-10"
      >
        <div className={`w-full max-w-sm ${shake ? 'shake' : ''}`}>
          <div className="glass-card p-8" style={{ border: '1px solid rgba(0,245,255,0.15)' }}>
            <div className="mb-8">
              <h1 className="font-orbitron font-black text-2xl text-void-cyan tracking-wider mb-1">
                ACCESS TERMINAL
              </h1>
              <p className="text-xs text-white/40 font-inter">Enter your credentials to proceed</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                icon={Mail}
                placeholder="commander@void.space"
                {...register('email')}
                error={errors.email?.message}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-orbitron tracking-wider text-void-cyan/70 uppercase">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-void-cyan/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-void rounded-lg py-2.5 pl-9 pr-10 text-sm w-full"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-void-cyan transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-void-crimson">{errors.password.message}</p>}
              </div>

              <Button type="submit" loading={isSubmitting} glow className="w-full mt-2">
                AUTHENTICATE
              </Button>
            </form>

            <p className="text-center text-xs text-white/30 font-inter mt-6">
              No access?{' '}
              <Link to="/signup" className="text-void-cyan hover:text-cyan-300 font-orbitron tracking-wide transition-colors">
                REQUEST ACCESS
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
