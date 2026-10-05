'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  sendMagicLink,
  signOutUser,
} from '@/lib/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  simulateLocalSignIn: (email: string) => void;
}

const LOCAL_DEMO_USER_KEY = 'marketlens_paper_demo_user';

export function useSupabaseAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Check if we have a locally stored demo session first
    if (typeof window !== 'undefined') {
      try {
        const storedDemo = localStorage.getItem(LOCAL_DEMO_USER_KEY);
        if (storedDemo) {
          const parsed = JSON.parse(storedDemo);
          setUser(parsed);
          setIsLoading(false);
        }
      } catch (e) {
        // Ignore
      }
    }

    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Fetch initial session
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Clear any demo user if real auth is present
          if (typeof window !== 'undefined') {
            localStorage.removeItem(LOCAL_DEMO_USER_KEY);
          }
        } else if (typeof window !== 'undefined') {
          try {
            const storedDemo = localStorage.getItem(LOCAL_DEMO_USER_KEY);
            if (storedDemo) {
              setUser(JSON.parse(storedDemo));
            }
          } catch (e) {
            // Ignore
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching Supabase session:', err);
        setIsLoading(false);
      });

    // 2. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LOCAL_DEMO_USER_KEY);
        }
      } else {
        setSession(null);
        let preservedDemoUser: User | null = null;
        if (typeof window !== 'undefined') {
          try {
            const storedDemo = localStorage.getItem(LOCAL_DEMO_USER_KEY);
            if (storedDemo) {
              preservedDemoUser = JSON.parse(storedDemo);
            }
          } catch (e) {
            // Ignore
          }
        }
        setUser(preservedDemoUser);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sendOtp = useCallback(async (email: string) => {
    return await sendMagicLink(email);
  }, []);

  const simulateLocalSignIn = useCallback((email: string) => {
    const mockUser: User = {
      id: 'usr_' + btoa(email).substring(0, 16).toLowerCase().replace(/[^a-z0-9]/g, 'x'),
      app_metadata: {},
      user_metadata: { email },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
    };
    setUser(mockUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(mockUser));
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_DEMO_USER_KEY);
    }
    await signOutUser();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  }, []);

  return {
    user,
    session,
    isLoading,
    isConfigured: configured,
    sendOtp,
    signOut,
    simulateLocalSignIn,
  };
}
