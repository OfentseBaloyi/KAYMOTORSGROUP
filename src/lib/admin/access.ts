/**
 * Whether the admin portal is switched on.
 * - `npm run dev`: always on.
 * - Production: only when ADMIN_ENABLED=true. Default is off.
 *
 * Kept free of server-only imports so proxy.ts can use it too.
 */
export function isAdminEnabled() {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ADMIN_ENABLED === "true";
}
