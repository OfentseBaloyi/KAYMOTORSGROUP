import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_LOGIN_PATH, isAdminEnabled } from "@/lib/admin/access";

/**
 * Runs before every /admin request (Next.js 16 renamed middleware.ts to proxy.ts).
 * - Admin switched off in production -> 404.
 * - Refreshes the Supabase login session cookies.
 * - Sends signed-out visitors to the login page.
 *
 * This is the convenient first line. requireAdmin() (src/lib/admin/require-admin.ts)
 * re-checks on every page and Server Action, and is the one that matters.
 */
export async function proxy(request: NextRequest) {
  if (!isAdminEnabled()) {
    // Rewrite to a path that doesn't exist, so visitors get the normal 404 page.
    return NextResponse.rewrite(new URL("/404-admin-disabled", request.url), { status: 404 });
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
        },
      },
    });

    // Verifies the session token and refreshes it if it has expired.
    const { data } = await supabase.auth.getClaims();
    const signedIn = Boolean(data?.claims?.sub);
    const onLogin = request.nextUrl.pathname === ADMIN_LOGIN_PATH;

    if (!signedIn && !onLogin) {
      const login = new URL(ADMIN_LOGIN_PATH, request.url);
      login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
      return redirectKeepingCookies(login, response);
    }
    if (signedIn && onLogin && !request.nextUrl.searchParams.has("error")) {
      return redirectKeepingCookies(new URL("/admin", request.url), response);
    }
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

/** Redirect while keeping any refreshed session cookies. */
function redirectKeepingCookies(to: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(to);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
  return redirect;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
