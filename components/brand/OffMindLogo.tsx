/**
 * OffMind Logo — Open loop mark + DM Sans Bold wordmark.
 *
 * Monochrome open loop: a circle with a gap at the upper-right,
 * suggesting openness and forward movement. Uses currentColor
 * so it automatically adapts to light/dark mode.
 *
 * Terracotta accent lives in UI (buttons, badges), NOT in the logo.
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
      {/* Open loop — circle arc with ~30° gap at upper-right */}
      <path
        d="M 72 28 A 36 38 0 1 0 80 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Favicon-optimized version (same open loop, works down to 16px)
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
