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
      className={`flex flex-1 flex-col md:pl-[var(--sidebar-offset)] pb-24`}
      style={{
        '--sidebar-offset': sidebarCollapsed ? '68px' : '252px',
        transition: 'padding-left 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
