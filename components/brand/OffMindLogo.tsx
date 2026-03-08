/**
 * OffMind Logo — Infinity symbol with monochromatic teal gradient.
 *
 * Represents the continuous GTD flow: capture → process → commit.
 * The infinity loop = thoughts flowing endlessly until OffMind breaks the cycle.
 *
 * Colors: Teal #14b8a6 → #2dd4bf → #5eead4
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
        <InfinityMark size={size} id={id} />
        <span
          className="font-semibold tracking-tight text-foreground"
          style={{ fontSize: size * 0.5 }}
        >
          OffMind
        </span>
      </div>
    );
  }

  return <InfinityMark size={size} id={id} className={className} />;
}

function InfinityMark({
  size,
  id,
  className = '',
}: {
  size: number;
  id: string;
  className?: string;
}) {
  // Aspect ratio: the infinity symbol is wider than tall
  const width = size;
  const height = size * 0.62;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OffMind logo"
    >
      <defs>
        {/* Main gradient: teal progression */}
        <linearGradient
          id={`${id}-main`}
          x1="0"
          y1="62"
          x2="200"
          y2="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="35%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="65%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        {/* Top highlight for 3D depth */}
        <linearGradient
          id={`${id}-highlight`}
          x1="100"
          y1="0"
          x2="100"
          y2="124"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>

        {/* Left loop gradient (lighter teal) */}
        <linearGradient
          id={`${id}-left`}
          x1="0"
          y1="30"
          x2="100"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="60%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>

        {/* Right loop gradient (deeper teal) */}
        <linearGradient
          id={`${id}-right`}
          x1="100"
          y1="30"
          x2="200"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="40%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        {/* Cross-over front piece gradient (blend zone) */}
        <linearGradient
          id={`${id}-cross`}
          x1="70"
          y1="20"
          x2="130"
          y2="104"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      <g filter={`url(#${id}-shadow)`}>
        {/*
          Infinity symbol constructed as two overlapping loops.
          The back strand goes behind, front strand crosses over.
        */}

        {/* BACK STRAND: right loop going behind the crossover */}
        <path
          d="M100,52 C100,52 108,20 140,14 C172,8 192,28 192,62 C192,96 172,116 140,110 C118,106 106,88 100,72"
          stroke={`url(#${id}-right)`}
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />

        {/* BACK STRAND: left loop going behind the crossover */}
        <path
          d="M100,72 C100,72 92,104 60,110 C28,116 8,96 8,62 C8,28 28,8 60,14 C82,18 94,36 100,52"
          stroke={`url(#${id}-left)`}
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />

        {/* FRONT STRAND: the crossover piece (teal coming from top-left, going to bottom-right) */}
        <path
          d="M88,38 C94,48 106,76 112,86"
          stroke={`url(#${id}-cross)`}
          strokeWidth="19"
          strokeLinecap="round"
          fill="none"
        />

        {/* Highlight overlay for 3D effect on left loop */}
        <path
          d="M100,72 C100,72 92,104 60,110 C28,116 8,96 8,62 C8,28 28,8 60,14 C82,18 94,36 100,52"
          stroke={`url(#${id}-highlight)`}
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {/* Highlight overlay for 3D effect on right loop */}
        <path
          d="M100,52 C100,52 108,20 140,14 C172,8 192,28 192,62 C192,96 172,116 140,110 C118,106 106,88 100,72"
          stroke={`url(#${id}-highlight)`}
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

/**
 * Favicon-optimized version (simplified for 16-20px)
 */
export function OffMindIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  const id = `om-ico-${Math.random().toString(36).slice(2, 7)}`;

  const width = size;
  const height = size * 0.62;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id={`${id}-g`}
          x1="0"
          y1="62"
          x2="200"
          y2="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="45%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>

      {/* Simplified single-path infinity for small sizes */}
      <path
        d="M100,52 C94,36 82,18 60,14 C28,8 8,28 8,62 C8,96 28,116 60,110 C92,104 100,72 100,72 C100,72 108,40 140,14 C172,8 192,28 192,62 C192,96 172,116 140,110 C108,104 100,52 100,52 Z"
        stroke={`url(#${id}-g)`}
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
