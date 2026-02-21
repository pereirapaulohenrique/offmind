'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          gap: '1rem',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h2>
          <p style={{ color: '#666' }}>An unexpected error occurred. The team has been notified.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #ccc',
              cursor: 'pointer',
              background: 'transparent',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
