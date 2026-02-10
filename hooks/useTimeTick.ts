'use client';

import { useState, useEffect } from 'react';

/**
 * Forces a re-render every `intervalMs` so that relative timestamps
 * ("2 min ago") stay accurate without a manual page refresh.
 */
export function useTimeTick(intervalMs = 30_000) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
