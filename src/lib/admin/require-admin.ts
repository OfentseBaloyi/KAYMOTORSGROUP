import "server-only";
import { notFound } from "next/navigation";
import { isAdminEnabled } from "@/lib/admin/access";

/**
 * Call at the top of every admin page and admin Server Action.
 *
 * Server Actions are plain POST requests and can be sent to any URL, so the
 * /admin check in proxy.ts alone is not enough: this is the real gate.
 *
 * TODO: add Supabase Auth. When auth is added, this is the one place to
 * check the session (e.g. via @supabase/ssr's createServerClient + cookies())
 * and confirm the user is an admin. Until then it only applies the
 * production on/off switch, so NEVER set ADMIN_ENABLED=true in production
 * before auth exists: anyone with the URL could edit stock.
 */
export async function requireAdmin() {
  if (!isAdminEnabled()) notFound();
}
