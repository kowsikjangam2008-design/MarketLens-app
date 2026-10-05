import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let browserClient: SupabaseClient | null = null;

/**
 * Returns true if Supabase credentials are configured in environment variables
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseUrl.trim() !== '' &&
      supabaseKey &&
      supabaseKey.trim() !== '' &&
      !supabaseUrl.includes('placeholder')
  );
}

/**
 * Returns a singleton Supabase client for browser and client-side components
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (typeof window === 'undefined') {
    // Return a fresh lightweight client for SSR
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

/**
 * Sends a passwordless Magic Link to the user's email
 */
export async function sendMagicLink(
  email: string,
  redirectTo?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const callbackUrl =
      redirectTo ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/paper-trading`
        : undefined);

    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send magic link.',
    };
  }
}

/**
 * Signs the current user out of Supabase
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error signing out.',
    };
  }
}
