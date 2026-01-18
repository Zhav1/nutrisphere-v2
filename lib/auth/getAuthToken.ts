// Helper function to get Supabase session token for API requests
import { supabase } from '@/lib/supabase/client';

export async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
