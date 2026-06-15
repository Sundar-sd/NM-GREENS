export default function GoldLockIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="glShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </linearGradient>
        <filter id="glShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="rgba(0,0,0,0.55)" />
        </filter>
      </defs>

      {/* Shackle */}
      <path
        d="M9 11V7.5C9 5.57 10.34 4 12 4s3 1.57 3 3.5V11"
        stroke="#f5c826"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glShadow)"
      />

      {/* Shackle highlight edge */}
      <path
        d="M13.8 7.5C13.8 5.57 12.46 4 12 4"
        stroke="#fff9d6"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Lock body */}
      <rect x="6" y="10" width="12" height="10.5" rx="2.5" ry="2.5" fill="#f5c826" filter="url(#glShadow)" />

      {/* Body glow ring */}
      <rect x="6" y="10" width="12" height="10.5" rx="2.5" ry="2.5" fill="none" stroke="#fff5c0" strokeWidth="1" opacity="0.7" />

      {/* Body top edge highlight */}
      <path
        d="M8.5 10.5 L15.5 10.5"
        stroke="#fff9d6"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Shine overlay */}
      <rect x="6" y="10" width="12" height="10.5" rx="2.5" ry="2.5" fill="url(#glShine)" />

      {/* Bevel border */}
      <rect x="6.6" y="10.6" width="10.8" height="9.3" rx="2" ry="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />

      {/* Keyhole outer ring */}
      <circle cx="12" cy="14.5" r="2.2" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />

      {/* Keyhole */}
      <circle cx="12" cy="14.5" r="1.5" fill="#1a0e02" />
      <rect x="11.3" y="15.7" width="1.4" height="2.4" rx="0.2" fill="#1a0e02" />

      {/* Keyhole rim highlight */}
      <circle cx="12" cy="14.5" r="1.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.35" />
    </svg>
  );
}
