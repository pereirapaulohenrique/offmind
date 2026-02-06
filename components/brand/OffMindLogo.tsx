/**
 * OffMind Logo
 *
 * A custom SVG monogram representing the three-layer GTD system:
 * - Three ascending arcs (Capture → Process → Commit)
 * - Converging into a stable base
 * - Forms an abstract "M" shape
 *
 * Uses the brand violet-indigo color with optional gradient treatment.
 */

interface OffMindLogoProps {
  size?: number;
  className?: string;
  variant?: 'mark' | 'full';
  showGradient?: boolean;
}

export function OffMindLogo({
  size = 32,
  className = '',
  variant = 'mark',
  showGradient = true
}: OffMindLogoProps) {
  const id = `om-gradient-${Math.random().toString(36).slice(2, 7)}`;

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <LogoMark size={size} gradientId={id} showGradient={showGradient} />
        <span
          className="font-semibold tracking-tight text-foreground"
          style={{ fontSize: size * 0.5 }}
        >
          OffMind
        </span>
      </div>
    );
  }

  return <LogoMark size={size} gradientId={id} showGradient={showGradient} className={className} />;
}

function LogoMark({
  size,
  gradientId,
  showGradient,
  className = ''
}: {
  size: number;
  gradientId: string;
  showGradient: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OffMind logo"
    >
      <defs>
        {showGradient && (
          <>
            <linearGradient id={`${gradientId}-main`} x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c5cfc" />
              <stop offset="50%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id={`${gradientId}-bg`} x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c5cfc" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.06" />
            </linearGradient>
          </>
        )}
      </defs>

      {/* Background rounded square */}
      <rect
        width="32"
        height="32"
        rx="8"
        fill={showGradient ? `url(#${gradientId}-bg)` : 'currentColor'}
        opacity={showGradient ? 1 : 0.08}
      />
      <rect
        width="32"
        height="32"
        rx="8"
        stroke={showGradient ? `url(#${gradientId}-main)` : 'currentColor'}
        strokeWidth="1"
        fill="none"
        opacity={0.2}
      />

      {/* Three arcs forming the "M" / mind flow
          Arc 1 (left, Capture - blue): starts low-left, arcs up
          Arc 2 (center, Process - blends): starts center-low, arcs highest
          Arc 3 (right, Commit - green): starts right, arcs up
          Connected at the base to form a stable foundation */}
      <g transform="translate(6, 7)">
        {/* Left arc - Capture */}
        <path
          d="M2 18 C2 12, 4 6, 6 4 C7 3, 8 3, 10 6"
          stroke={showGradient ? '#60a5fa' : 'currentColor'}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity={showGradient ? 1 : 0.7}
        />

        {/* Center arc - Process (tallest) */}
        <path
          d="M10 6 C10 4, 10 2, 10 1 C10 0.5, 10.5 0.5, 10.5 1 C10.5 2, 10.5 4, 10.5 6"
          stroke={showGradient ? '#fbbf24' : 'currentColor'}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity={showGradient ? 0.9 : 0.5}
        />

        {/* Right arc - Commit */}
        <path
          d="M10.5 6 C12.5 3, 13.5 3, 14.5 4 C16.5 6, 18.5 12, 18.5 18"
          stroke={showGradient ? '#34d399' : 'currentColor'}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity={showGradient ? 1 : 0.7}
        />

        {/* Base line - stable foundation */}
        <path
          d="M2 18 L18.5 18"
          stroke={showGradient ? `url(#${gradientId}-main)` : 'currentColor'}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity={showGradient ? 0.8 : 0.5}
        />
      </g>
    </svg>
  );
}

/**
 * Favicon-optimized version (simpler paths for small sizes)
 */
export function OffMindIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="16" height="16" rx="3.5" fill="#7c5cfc" fillOpacity="0.15" />
      <g transform="translate(3, 3.5)">
        <path
          d="M1 9 C1 6, 2 3, 3.5 2 L5 3"
          stroke="#60a5fa"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M5 3 L5 0.5"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M5.2 3 C6.5 2, 7 2, 7.5 2.5 C9 4, 9.5 6, 9.5 9"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M1 9 L9.5 9"
          stroke="#7c5cfc"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
