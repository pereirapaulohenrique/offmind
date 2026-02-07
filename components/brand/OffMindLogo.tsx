/**
 * OffMind Logo — Infinity symbol with teal-to-terracotta gradient.
 *
 * Represents the continuous GTD flow: capture (teal/blue) → process → commit (terracotta/warm).
 * The infinity loop = thoughts flowing endlessly until OffMind breaks the cycle.
 *
 * Colors: Teal #06b6d4 → Terracotta #ea580c (vibrant)
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
      <div className={`flex items-center gap-3 ${className}`}>
        <InfinityMark size={size} id={id} />
        <Wordmark size={size} id={id} />
      </div>
    );
  }

  return <InfinityMark size={size} id={id} className={className} />;
}

/* ─── Wordmark: "Off" light + "Mind" bold, gradient text ─── */
function Wordmark({ size, id }: { size: number; id: string }) {
  const fontSize = size * 0.48;

  return (
    <svg
      width={fontSize * 4.2}
      height={fontSize * 1.3}
      viewBox="0 0 210 65"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-wg`}
          x1="0"
          y1="32"
          x2="210"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#08c4dc" />
          <stop offset="40%" stopColor="#a0866a" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {/* "Off" — lighter weight */}
      <text
        x="0"
        y="48"
        fontFamily="var(--font-geist-sans), 'Geist Sans', system-ui, sans-serif"
        fontSize="52"
        fontWeight="300"
        letterSpacing="-1"
        fill={`url(#${id}-wg)`}
      >
        Off
      </text>
      {/* "Mind" — bold weight */}
      <text
        x="82"
        y="48"
        fontFamily="var(--font-geist-sans), 'Geist Sans', system-ui, sans-serif"
        fontSize="52"
        fontWeight="700"
        letterSpacing="-1.5"
        fill={`url(#${id}-wg)`}
      >
        Mind
      </text>
    </svg>
  );
}

/* ─── Infinity mark: elongated oval loops, thick strokes ─── */
function InfinityMark({
  size,
  id,
  className = '',
}: {
  size: number;
  id: string;
  className?: string;
}) {
  // Wider aspect ratio — elongated ovals, not circles
  const width = size;
  const height = size * 0.5;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 260 104"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OffMind logo"
    >
      <defs>
        {/* Main gradient: vibrant teal (left) to vibrant terracotta (right) */}
        <linearGradient
          id={`${id}-main`}
          x1="0"
          y1="52"
          x2="260"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="30%" stopColor="#0891b2" />
          <stop offset="50%" stopColor="#b8703a" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>

        {/* Top highlight for 3D depth */}
        <linearGradient
          id={`${id}-highlight`}
          x1="130"
          y1="0"
          x2="130"
          y2="104"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </linearGradient>

        {/* Left loop gradient (vibrant teal) */}
        <linearGradient
          id={`${id}-left`}
          x1="0"
          y1="20"
          x2="130"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#08c4dc" />
          <stop offset="100%" stopColor="#0e9aaf" />
        </linearGradient>

        {/* Right loop gradient (vibrant terracotta/orange) */}
        <linearGradient
          id={`${id}-right`}
          x1="130"
          y1="20"
          x2="260"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#f06520" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc4510" />
        </linearGradient>

        {/* Cross-over front piece gradient (blend zone) */}
        <linearGradient
          id={`${id}-cross`}
          x1="95"
          y1="14"
          x2="165"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#a07848" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Subtle drop shadow */}
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000000" floodOpacity="0.10" />
        </filter>
      </defs>

      <g filter={`url(#${id}-shadow)`}>
        {/*
          Infinity symbol — elongated oval loops.
          Wider viewBox (260x104) with ovals stretched to x extremes.
          Back strands render first, front crossover on top.
        */}

        {/* BACK STRAND: right loop (oval, stretched right) */}
        <path
          d="M130,42 C138,24 156,8 190,8 C232,8 252,28 252,52 C252,76 232,96 190,96 C160,96 142,78 130,62"
          stroke={`url(#${id}-right)`}
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
        />

        {/* BACK STRAND: left loop (oval, stretched left) */}
        <path
          d="M130,62 C122,80 104,96 70,96 C28,96 8,76 8,52 C8,28 28,8 70,8 C100,8 118,26 130,42"
          stroke={`url(#${id}-left)`}
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
        />

        {/* FRONT STRAND: crossover piece (teal top-left → terracotta bottom-right) */}
        <path
          d="M116,30 C122,40 138,64 144,74"
          stroke={`url(#${id}-cross)`}
          strokeWidth="26"
          strokeLinecap="round"
          fill="none"
        />

        {/* Highlight overlay — left loop */}
        <path
          d="M130,62 C122,80 104,96 70,96 C28,96 8,76 8,52 C8,28 28,8 70,8 C100,8 118,26 130,42"
          stroke={`url(#${id}-highlight)`}
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />

        {/* Highlight overlay — right loop */}
        <path
          d="M130,42 C138,24 156,8 190,8 C232,8 252,28 252,52 C252,76 232,96 190,96 C160,96 142,78 130,62"
          stroke={`url(#${id}-highlight)`}
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
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
  const height = size * 0.5;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 260 104"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id={`${id}-g`}
          x1="0"
          y1="52"
          x2="260"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="45%" stopColor="#7a8a5a" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* Simplified single-path infinity for small sizes */}
      <path
        d="M130,42 C118,26 100,8 70,8 C28,8 8,28 8,52 C8,76 28,96 70,96 C104,96 122,80 130,62 C138,78 156,96 190,96 C232,96 252,76 252,52 C252,28 232,8 190,8 C156,8 142,26 130,42 Z"
        stroke={`url(#${id}-g)`}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
