import { useState, useCallback } from 'react';
import type { Destination } from '@/types/database';

interface SuggestionResult {
  destination: Destination | null;
  destinationSlug: string;
  confidence: number;
  reasoning: string;
}

export function useAISuggestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestDestination = useCallback(
    async (title: string, notes?: string, itemId?: string) => {
      if (!title.trim()) {
        setSuggestion(null);
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/suggest-destination', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, notes, itemId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get suggestion');
        }

        const result = await response.json();
        setSuggestion(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setSuggestion(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearSuggestion = useCallback(() => {
    setSuggestion(null);
    setError(null);
  }, []);

  return {
    suggestDestination,
    clearSuggestion,
    suggestion,
    isLoading,
    error,
  };
}
