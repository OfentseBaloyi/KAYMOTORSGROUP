import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Anonymous Supabase client for public reads and viewing-request inserts.
 * Uses the publishable key, so Row Level Security applies.
 *
 * There are no visitor logins, so this is a plain client without cookies.
 * (@supabase/ssr's cookie-based client comes in when Supabase Auth is added.)
 */
export function createPublicClient() {
  return createClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
