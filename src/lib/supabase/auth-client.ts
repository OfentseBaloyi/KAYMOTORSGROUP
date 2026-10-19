import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

/**
 * Supabase client that reads/writes the admin's login session cookies.
 * Use in Server Components and Server Actions for anything auth-related.
 * (Data writes still go through the service-role client after requireAdmin().)
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components can't set cookies. That's fine: proxy.ts
          // refreshes the session on every /admin request.
        }
      },
    },
  });
}
