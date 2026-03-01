import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton client – reused across warm Lambda invocations to avoid
// repeated TLS handshakes and Supabase auth header construction on
// every request. Mirrors the same pattern used for the Redis client.
let _supabase: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set",
    );
  }

  _supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabase;
}
