'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { REFRESH_CONFIG } from '@/config/constants';

export type UserMode = 'beginner' | 'advanced';

interface SettingsState {
  mode: UserMode;
  refreshIntervalMs: number;
  hasHydrated: boolean;
  setMode: (mode: UserMode) => void;
  setRefreshIntervalMs: (ms: number) => void;
  setHasHydrated: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mode: 'beginner',
      refreshIntervalMs: REFRESH_CONFIG.defaultIntervalMs,
      hasHydrated: false,
      setMode: (mode) => set({ mode }),
      setRefreshIntervalMs: (refreshIntervalMs) => {
        const clamped = Math.max(
          REFRESH_CONFIG.minIntervalMs,
          Math.min(REFRESH_CONFIG.maxIntervalMs, refreshIntervalMs)
        );
        set({ refreshIntervalMs: clamped });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'marketlens_settings',
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
