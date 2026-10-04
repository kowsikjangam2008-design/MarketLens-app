'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const DEFAULT_WATCHLIST = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'];

interface WatchlistState {
  symbols: string[];
  hasHydrated: boolean;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  reorderSymbols: (newOrder: string[]) => void;
  isInWatchlist: (symbol: string) => boolean;
  setHasHydrated: (val: boolean) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: DEFAULT_WATCHLIST,
      hasHydrated: false,
      addSymbol: (symbol: string) => {
        const clean = symbol.trim().toUpperCase();
        if (!clean) return;
        const current = get().symbols;
        if (!current.includes(clean)) {
          set({ symbols: [...current, clean] });
        }
      },
      removeSymbol: (symbol: string) => {
        const clean = symbol.trim().toUpperCase();
        set({ symbols: get().symbols.filter((s) => s !== clean) });
      },
      reorderSymbols: (newOrder: string[]) => {
        set({ symbols: newOrder });
      },
      isInWatchlist: (symbol: string) => {
        const clean = symbol.trim().toUpperCase();
        return get().symbols.includes(clean);
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'marketlens_watchlist',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null,
      })),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
