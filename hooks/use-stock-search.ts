'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchResult } from '@/types/market';
import { REFRESH_CONFIG } from '@/config/constants';

export function useStockSearch(initialQuery = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs]);

  const queryResult = useQuery<SearchResult[], Error>({
    queryKey: ['stock-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) {
        return [];
      }

      const res = await fetch(`/api/market/search?q=${encodeURIComponent(debouncedQuery)}`);
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || body.message || 'Search failed');
      }

      return (body.data as SearchResult[]) || [];
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: REFRESH_CONFIG.staleTimeSearchMs,
    retry: 1,
  });

  return {
    query,
    setQuery,
    debouncedQuery,
    ...queryResult,
  };
}
