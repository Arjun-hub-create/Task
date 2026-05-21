import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Shield, UserCheck } from 'lucide-react';
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
  username: z.string().min(3, 'Min 3 characters').max(30),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');
  const [shake, setShake] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await signup({ ...data, role });
    if (result.success) {
      toast.success('Identity confirmed. Welcome to VOID.', 'CLEARANCE GRANTED');
      navigate('/dashboard');
    } else {
      setShake(true);
      toast.error(result.message, 'REGISTRATION FAILED');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden theme-bg">
      <StarField />

      {/* Left decorative panel */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="hidden lg:flex flex-1 items-center justify-center relative z-10"
      >
        <div className="text-center space-y-6 px-8">
          <div className="font-orbitron font-black text-6xl tracking-widest"
            style={{ background: 'linear-gradient(135deg,#00F5FF,#7B2FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 15px rgba(0,245,255,0.3))' }}>
            VOID
          </div>
          <p className="font-orbitron text-sm tracking-widest text-void-cyan/60">JOIN THE COMMAND CENTER</p>
          <div className="flex justify-center gap-6">
            {['✦', '◈', '⬡'].map((s, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                className="text-3xl text-void-cyan/30"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right form */}
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="flex-1 lg:max-w-md flex items-center justify-center p-8 relative z-10"
      >
        <div className={`w-full max-w-sm ${shake ? 'shake' : ''}`}>
          <div className="glass-card p-8" style={{ border: '1px solid rgba(0,245,255,0.15)' }}>
            <div className="mb-6">
              <h1 className="font-orbitron font-black text-2xl text-void-cyan tracking-wider mb-1">
                REQUEST ACCESS
              </h1>
              <p className="text-xs text-white/40 font-inter">Create your VOID account</p>
            </div>

            {/* Role selector */}
            <div className="mb-5">
              <label className="text-xs font-orbitron tracking-wider text-void-cyan/70 uppercase block mb-2">
                Clearance Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'user', label: 'OPERATIVE', icon: UserCheck, desc: 'Execute missions' },
                  { id: 'manager', label: 'COMMANDER', icon: Shield, desc: 'Full control' },
                ].map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id)}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all duration-200 ${
                      role === id
                        ? 'border-void-cyan/50 bg-void-cyan/10 text-void-cyan'
                        : 'border-white/10 bg-white/3 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-orbitron tracking-wider">{label}</span>
                    <span className="text-[10px] font-inter opacity-60">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Input
                label="Username"
                icon={User}
                placeholder="your_callsign"
                {...register('username')}
                error={errors.username?.message}
              />
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
                    placeholder="Min 6 characters"
                    className="input-void rounded-lg py-2.5 pl-9 pr-10 text-sm w-full"
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-void-cyan transition-colors">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-void-crimson">{errors.password.message}</p>}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                icon={Lock}
                placeholder="Repeat password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />

              <Button type="submit" loading={isSubmitting} glow className="w-full mt-2">
                INITIATE SEQUENCE
              </Button>
            </form>

            <p className="text-center text-xs text-white/30 font-inter mt-5">
              Already have access?{' '}
              <Link to="/login" className="text-void-cyan hover:text-cyan-300 font-orbitron tracking-wide transition-colors">
                ACCESS TERMINAL
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
