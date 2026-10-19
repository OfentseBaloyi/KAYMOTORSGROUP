/**
 * Whether the admin portal is switched on at all.
 * - `npm run dev`: always on.
 * - Production: only when ADMIN_ENABLED=true. Default is off.
 * Being switched on still requires signing in (see require-admin.ts).
 *
 * Kept free of server-only imports so proxy.ts can use it too.
 */
export function isAdminEnabled() {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ADMIN_ENABLED === "true";
}

/**
 * Emails allowed into the admin, from ADMIN_EMAILS (comma separated).
 * A Supabase account alone is not enough: the email must be on this list.
 * Empty list = nobody gets in (fail closed).
 */
export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export const ADMIN_LOGIN_PATH = "/admin/login";

/** Only allow redirecting back to admin pages after login (no open redirects). */
export function safeAdminNext(next: string | null | undefined) {
  if (next && next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith(ADMIN_LOGIN_PATH)) {
    return next;
  }
  return "/admin";
}
