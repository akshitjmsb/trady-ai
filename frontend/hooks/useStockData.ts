// frontend/hooks/useStockData.ts

import { useState, useEffect } from 'react';

/**
 * A reusable custom hook to fetch stock data from a given API endpoint.
 * It handles loading, error, and data states.
 * @param endpoint The API endpoint to fetch data from.
 * @returns An object containing the fetched data, loading state, and any errors.
 */
export function useStockData<T>(endpoint: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // The API endpoint is now relative, relying on the Next.js rewrite configuration.
        const response = await fetch(`/api${endpoint}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || errData.error || 'Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}
