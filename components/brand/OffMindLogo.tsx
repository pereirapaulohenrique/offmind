/**
 * OffMind Logo — Warm amber gradient sphere with two lines beneath.
 *
 * Represents "get it off your mind" — a thought (sphere) landing
 * safely on a stable base (lines).
 *
 * Gradient: deep amber #92400e → amber #d97706 → warm gold #fbbf24
 */

interface OffMindLogoProps {
  size?: number;
  className?: string;
  variant?: 'mark' | 'full';
}

export function OffMindLogo({
  size = 32,
  className = '',
  variant = 'mark',
}: OffMindLogoProps) {
  const id = `om-${Math.random().toString(36).slice(2, 7)}`;

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <SphereMark size={size} id={id} />
        <span
          className="font-semibold tracking-tight text-foreground"
          style={{ fontSize: size * 0.5 }}
        >
          OffMind
        </span>
      </div>
    );
  }

  return <SphereMark size={size} id={id} className={className} />;
}

function SphereMark({
  size,
  id,
  className = '',
}: {
  size: number;
  id: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OffMind logo"
    >
      <defs>
        <linearGradient
          id={`${id}-grad`}
          x1="20"
          y1="90"
          x2="100"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="40%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="0.35" cy="0.3" r="0.65">
          <stop offset="0%" stopColor="rgba(255,255,255,0.20)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.85" r="0.5">
          <stop offset="0%" stopColor="rgba(0,0,0,0.30)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Sphere */}
      <circle cx="60" cy="48" r="38" fill={`url(#${id}-grad)`} />
      <circle cx="60" cy="48" r="38" fill={`url(#${id}-shine)`} />
      <circle cx="60" cy="48" r="38" fill={`url(#${id}-shadow)`} />

      {/* Two lines beneath */}
      <rect x="30" y="94" width="60" height="4" rx="2" fill="#f59e0b" opacity="0.6" />
      <rect x="38" y="103" width="44" height="3.5" rx="1.75" fill="#f59e0b" opacity="0.3" />
    </svg>
  );
}

/**
 * Favicon-optimized version (simplified for 16-20px)
 */
export function OffMindIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  const id = `om-ico-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id={`${id}-grad`}
          x1="20"
          y1="90"
          x2="100"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="40%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="48" r="38" fill={`url(#${id}-grad)`} />
      <rect x="30" y="94" width="60" height="5" rx="2.5" fill="#f59e0b" opacity="0.6" />
      <rect x="38" y="104" width="44" height="4" rx="2" fill="#f59e0b" opacity="0.3" />
    </svg>
  );
}
