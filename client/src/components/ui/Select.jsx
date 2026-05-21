import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  className = '',
  children,
  ...props
}, ref) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-xs font-orbitron tracking-wider text-void-cyan/70 uppercase theme-label">
        {label}
      </label>
    )}
    <div className="select-void-wrapper">
      <select ref={ref} className="select-void" {...props}>
        {children}
      </select>
      <ChevronDown size={14} className="select-void-chevron" aria-hidden />
    </div>
    {error && <p className="text-xs text-void-crimson">{error}</p>}
  </div>
));

Select.displayName = 'Select';

export default Select;
