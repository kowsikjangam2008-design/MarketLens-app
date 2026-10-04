'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export function useMarketRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastDataUpdatedAt, setLastDataUpdatedAt] = useState<number | null>(null);
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Monitor tab visibility
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Monitor query cache for actual successful live data updates
  useEffect(() => {
    const checkCache = () => {
      const queries = queryClient.getQueryCache().getAll();
      let maxUpdatedAt = 0;
      for (const q of queries) {
        const key = q.queryKey[0];
        if (key === 'stock-quote' || key === 'batch-quotes') {
          if (q.state.status === 'success' && q.state.dataUpdatedAt > maxUpdatedAt) {
            // Verify data is non-empty
            const data = q.state.data;
            const hasContent = Array.isArray(data) ? data.length > 0 : Boolean(data);
            if (hasContent) {
              maxUpdatedAt = q.state.dataUpdatedAt;
            }
          }
        }
      }
      if (maxUpdatedAt > 0) {
        setLastDataUpdatedAt(maxUpdatedAt);
      }
    };

    checkCache();
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      checkCache();
    });
    return () => unsubscribe();
  }, [queryClient]);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock-quote'] }),
        queryClient.invalidateQueries({ queryKey: ['batch-quotes'] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const hasData = lastDataUpdatedAt !== null;
  const formattedLastUpdated = lastDataUpdatedAt ? format(new Date(lastDataUpdatedAt), 'hh:mm:ss a') : null;

  return {
    refreshAll,
    isRefreshing,
    hasData,
    lastDataUpdatedAt,
    formattedLastUpdated,
    isTabVisible,
  };
}
