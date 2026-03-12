/**
 * OffMind Logo — Open loop mark with green gradient + DM Sans Bold wordmark.
 *
 * The open loop uses the brand gradient (#5eebb8 → #0d9478),
 * matching the finished SVG in tinker/logo-wm-v3-full-bold.svg.
 * Terracotta accent lives in UI (buttons, badges), NOT in the logo.
 */

import { useId } from 'react';

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
  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <OpenLoopMark size={size} />
        <span
          className="font-sans font-bold tracking-tight text-foreground"
          style={{ fontSize: size * 0.58, lineHeight: 1 }}
        >
          offmind
        </span>
      </div>
    );
  }

  return <OpenLoopMark size={size} className={className} />;
}

function OpenLoopMark({
  size,
  className = '',
}: {
  size: number;
  className?: string;
}) {
  const gradId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="OffMind logo"
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1="20"
          y1="18"
          x2="80"
          y2="82"
        >
          <stop offset="0" stopColor="#5eebb8" />
          <stop offset="1" stopColor="#0d9478" />
        </linearGradient>
      </defs>
      {/* Open loop — circle arc with ~30° gap at upper-right */}
      <path
        d="M 72 28 A 36 38 0 1 0 80 40"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="11"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Favicon-optimized version (same open loop with gradient)
 */
export function OffMindIcon({
  size = 16,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return <OpenLoopMark size={size} className={className} />;
}
