import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { ADMIN_LOGIN_PATH, isAdminEnabled, isAllowedAdminEmail } from "@/lib/admin/access";
import { createAuthClient } from "@/lib/supabase/auth-client";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * The real admin gate. Call at the top of every admin page and admin Server
 * Action, before touching the service-role client.
 *
 * Server Actions are plain POST requests that can be sent to any URL, so the
 * check in proxy.ts is only a convenience (redirects + session refresh).
 * This function is what actually protects the data.
 *
 * 1. Admin switched off (production without ADMIN_ENABLED=true) -> 404.
 * 2. Not signed in -> login page.
 * 3. Signed in but email not in ADMIN_EMAILS -> signed out, back to login.
 */
// cache(): several components on one page can call this; Supabase is asked once per request.
export const requireAdmin = cache(async (): Promise<AdminUser> => {
  if (!isAdminEnabled()) notFound();

  const supabase = await createAuthClient();
  // getUser() asks Supabase Auth to confirm the session, so a deleted or
  // banned user is rejected even if their cookie hasn't expired yet.
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) redirect(ADMIN_LOGIN_PATH);

  if (!isAllowedAdminEmail(user.email)) {
    await supabase.auth.signOut();
    redirect(`${ADMIN_LOGIN_PATH}?error=not-allowed`);
  }

  return { id: user.id, email: user.email! };
});
