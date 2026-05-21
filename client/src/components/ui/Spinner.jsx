const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 20, md: 36, lg: 56, xl: 80 };
  const px = sizes[size] || sizes.md;

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      role="status"
      aria-label="Loading"
    >
      <svg
        viewBox="0 0 50 50"
        width={px}
        height={px}
        style={{ filter: 'drop-shadow(0 0 6px #00F5FF)' }}
      >
        {/* Outer orbit ring */}
        <circle
          cx="25" cy="25" r="20"
          fill="none"
          stroke="rgba(0,245,255,0.15)"
          strokeWidth="2"
        />
        {/* Spinning arc */}
        <circle
          cx="25" cy="25" r="20"
          fill="none"
          stroke="#00F5FF"
          strokeWidth="2"
          strokeDasharray="30 95"
          strokeLinecap="round"
          style={{ transformOrigin: '25px 25px', animation: 'spin 1s linear infinite' }}
        />
        {/* Inner dot */}
        <circle cx="25" cy="5" r="2.5" fill="#00F5FF" style={{ transformOrigin: '25px 25px', animation: 'spin 1s linear infinite' }} />

        {/* Inner ring */}
        <circle
          cx="25" cy="25" r="12"
          fill="none"
          stroke="rgba(123,47,255,0.3)"
          strokeWidth="1.5"
        />
        <circle
          cx="25" cy="25" r="12"
          fill="none"
          stroke="#7B2FFF"
          strokeWidth="1.5"
          strokeDasharray="15 60"
          strokeLinecap="round"
          style={{ transformOrigin: '25px 25px', animation: 'spin 0.7s linear infinite reverse' }}
        />

        {/* Core */}
        <circle cx="25" cy="25" r="3" fill="#00F5FF" opacity="0.8" />

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </svg>
    </div>
  );
};

export default Spinner;
