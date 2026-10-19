import { NextResponse, type NextRequest } from "next/server";
import { isAdminEnabled } from "@/lib/admin/access";

/**
 * Hides /admin in production unless ADMIN_ENABLED=true.
 * (Next.js 16 renamed middleware.ts to proxy.ts; same idea.)
 *
 * TODO: add Supabase Auth. Once it exists, refresh the session here and
 * redirect signed-out users to a login page. requireAdmin() must still
 * check too, because Server Actions don't always go through /admin URLs.
 */
export function proxy(request: NextRequest) {
  if (!isAdminEnabled()) {
    // Rewrite to a path that doesn't exist, so visitors get the normal 404 page.
    return NextResponse.rewrite(new URL("/404-admin-disabled", request.url), { status: 404 });
  }
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
