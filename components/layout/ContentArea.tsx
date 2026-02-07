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
        '--sidebar-offset': sidebarCollapsed ? '72px' : '260px',
        transition: 'padding-left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
