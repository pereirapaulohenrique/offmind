'use client';

import { useUIStore } from '@/stores/ui';

/**
 * Client component that provides sidebar-aware margin and capture bar padding.
 * Wraps the main content area in the dashboard layout.
 */
export function ContentArea({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div
      className={`flex flex-1 flex-col transition-all duration-200 md:pl-[var(--sidebar-offset)] pb-20`}
      style={{
        '--sidebar-offset': sidebarCollapsed ? '68px' : '252px',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
