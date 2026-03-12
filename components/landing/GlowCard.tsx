'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  /** Whether to show hover lift effect */
  hover?: boolean;
  /** Whether this card is visually highlighted */
  highlighted?: boolean;
}

/**
 * Glass card with backdrop blur and layered shadow system.
 * Layer 1: backdrop-blur for glass depth
 * Layer 2: tight shadow for edge definition
 * Layer 3: wider shadow for atmospheric lift
 * Plus a subtle top-edge highlight for directional light simulation.
 */
export function GlowCard({
  children,
  className,
  hover = true,
  highlighted = false,
}: GlowCardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-2xl border p-6 sm:p-8',
        'backdrop-blur-md bg-white/[0.02]',
        highlighted
          ? 'border-teal-500/20 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.25),0_0_24px_rgba(45,212,191,0.04)]'
          : 'border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.2)]',
        hover &&
          'transition-all duration-300 ease-out hover:border-white/[0.1] hover:translate-y-[-2px] hover:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_12px_40px_rgba(0,0,0,0.3)]',
        className,
      )}
    >
      {/* Top-edge directional light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      {children}
    </div>
  );
}
