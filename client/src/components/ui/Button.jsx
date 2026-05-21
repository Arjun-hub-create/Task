import { motion } from 'framer-motion';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  glow = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-orbitron font-semibold tracking-wider rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-void-cyan text-void-black hover:bg-cyan-300 active:scale-95',
    secondary: 'bg-transparent border border-void-cyan text-void-cyan hover:bg-void-glass active:scale-95',
    danger: 'bg-transparent border border-void-crimson text-void-crimson hover:bg-red-950 active:scale-95',
    ghost: 'bg-transparent text-white/60 hover:text-void-cyan hover:bg-void-glass active:scale-95',
    purple: 'bg-void-purple text-white hover:bg-purple-500 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${glow ? 'btn-glow' : ''} ${className}`}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </motion.button>
  );
};

export default Button;
