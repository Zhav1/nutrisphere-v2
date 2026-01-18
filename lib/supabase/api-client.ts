import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for API routes using Bearer token authentication.
 * This bypasses cookie handling and uses the Authorization header directly.
 * 
 * @param token The Bearer token from the request header (without 'Bearer ' prefix)
 */
export function createApiClient(token: string) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for API routes
        },
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
}
