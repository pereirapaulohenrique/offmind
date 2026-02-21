'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </Suspense>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
