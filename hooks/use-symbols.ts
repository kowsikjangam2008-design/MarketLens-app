'use client';

import { useQuery } from '@tanstack/react-query';
import { REFRESH_CONFIG } from '@/config/constants';

export function useSymbols() {
  return useQuery<string[], Error>({
    queryKey: ['market-symbols'],
    queryFn: async () => {
      const res = await fetch('/api/market/symbols');
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || body.message || 'Failed to fetch symbols');
      }
      return (body.data as string[]) || [];
    },
    staleTime: REFRESH_CONFIG.staleTimeSymbolsMs, // 1 hour cache
    retry: 1,
  });
}
