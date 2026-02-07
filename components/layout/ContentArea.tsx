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
      className={`flex flex-1 flex-col md:pl-[var(--sidebar-offset)] pb-20`}
      style={{
        '--sidebar-offset': sidebarCollapsed ? '68px' : '252px',
        transition: 'padding-left 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
