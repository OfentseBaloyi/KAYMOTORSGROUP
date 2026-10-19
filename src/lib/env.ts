import { siteConfig } from "@/config/site";

/**
 * Public env values (safe in the browser).
 * NEXT_PUBLIC_* values are inlined at build time, so they must be read with
 * their full literal names, not via a dynamic key.
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url).replace(/\/+$/, ""),
};

/** True when the public Supabase env vars are set. Otherwise the app runs on seed data. */
export function isSupabaseConfigured() {
  return Boolean(publicEnv.supabaseUrl && publicEnv.supabasePublishableKey);
}
