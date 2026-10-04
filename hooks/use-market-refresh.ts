'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export function useMarketRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
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

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock-quote'] }),
        queryClient.invalidateQueries({ queryKey: ['batch-quotes'] }),
      ]);
      setLastRefreshedAt(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const formattedLastUpdated = format(lastRefreshedAt, 'hh:mm:ss a');

  return {
    refreshAll,
    isRefreshing,
    lastRefreshedAt,
    formattedLastUpdated,
    isTabVisible,
  };
}
