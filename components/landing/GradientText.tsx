import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  /** Gradient direction — defaults to right */
  from?: string;
  to?: string;
}

/**
 * Inline gradient text for key phrases.
 * Uses bg-clip-text technique for smooth multi-color text.
 */
export function GradientText({
  children,
  className,
  from = 'from-teal-400',
  to = 'to-emerald-400',
}: GradientTextProps) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        from,
        to,
        className,
      )}
    >
      {children}
    </span>
  );
}
