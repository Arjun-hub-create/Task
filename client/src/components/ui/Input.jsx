import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs font-orbitron tracking-wider text-void-cyan/70 uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-void-cyan/50">
            <Icon size={16} />
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full input-void rounded-lg py-2.5 pr-4 text-sm ${Icon ? 'pl-9' : 'pl-4'} ${error ? 'border-void-crimson focus:border-void-crimson' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-void-crimson font-inter">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
