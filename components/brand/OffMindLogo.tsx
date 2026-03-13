/**
 * OffMind Logo — uses the final PNG assets.
 *
 * Three variants:
 * - 'mark'     → open loop icon only
 * - 'full'     → loop + "offmind" wordmark
 * - 'wordmark' → "offmind" text only
 */

import Image from 'next/image';

interface OffMindLogoProps {
  size?: number;
  className?: string;
  variant?: 'mark' | 'full' | 'wordmark';
}

export function OffMindLogo({
  size = 32,
  className = '',
  variant = 'mark',
}: OffMindLogoProps) {
  if (variant === 'full') {
    return (
      <Image
        src="/offmind-logo-wordmark.png"
        alt="offmind"
        width={Math.round(size * 3.5)}
        height={size}
        className={`dark:invert ${className}`}
        style={{ height: size, width: 'auto' }}
        quality={100}
        priority
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <Image
        src="/offmind-wordmark.png"
        alt="offmind"
        width={size * 3}
        height={size}
        className={`dark:invert ${className}`}
        style={{ height: size, width: 'auto' }}
        quality={100}
        priority
      />
    );
  }

  return (
    <Image
      src="/offmind-logo.png"
      alt="offmind"
      width={size}
      height={size}
      className={`dark:invert ${className}`}
      style={{ height: size, width: size }}
      quality={100}
      priority
    />
  );
}

/**
 * Favicon-optimized version — same mark, smaller default
 */
export function OffMindIcon({
  size = 16,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return <OffMindLogo size={size} className={className} variant="mark" />;
}
