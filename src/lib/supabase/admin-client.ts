import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Service-role Supabase client. BYPASSES Row Level Security.
 * Server only: the `server-only` import makes the build fail if a Client
 * Component ever imports this file, so the key can't leak to the browser.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!publicEnv.supabaseUrl || !serviceKey) {
    throw new Error(
      "Supabase admin access needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }
  return createClient(publicEnv.supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminConfigured() {
  return Boolean(publicEnv.supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
