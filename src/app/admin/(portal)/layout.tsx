import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdminNav, AdminNavList } from "@/components/admin/admin-nav";
import { siteConfig } from "@/config/site";
import { notFound } from "next/navigation";
import { isAdminEnabled } from "@/lib/admin/access";
import { requireAdmin } from "@/lib/admin/require-admin";
import { signOut } from "@/lib/actions/auth";
import { isAdminConfigured } from "@/lib/supabase/admin-client";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
          <Link href="/admin" className="flex items-center gap-2" aria-label="Admin dashboard">
            <Image
              src={siteConfig.brand.logo}
              alt=""
              width={siteConfig.brand.logoWidth}
              height={siteConfig.brand.logoHeight}
              className="h-9 w-auto"
            />
            <span className="font-display text-lg font-bold uppercase tracking-wide">Admin</span>
          </Link>
          <Suspense fallback={<AdminNavList pathname="" />}>
            <AdminNav />
          </Suspense>
          <div className="ml-auto flex items-center gap-1">
            <Link href="/" className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-muted hover:text-navy-950">
              View site
            </Link>
            <Suspense>
              <Account />
            </Suspense>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </>
  );
}

async function Account() {
  await connection();
  if (!isAdminConfigured()) return null;
  const admin = await requireAdmin();
  return (
    <form action={signOut} className="flex items-center gap-1">
      <span className="hidden max-w-48 truncate text-sm text-muted lg:inline" title={admin.email}>
        {admin.email}
      </span>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center gap-1 rounded-card px-2 text-sm font-semibold text-navy-950 hover:bg-sand"
      >
        <LogOut size={16} aria-hidden="true" /> Sign out
      </button>
    </form>
  );
}

/**
 * Runs per request (never at build time), so the ADMIN_ENABLED switch, the
 * login and the secret-key check all reflect the live environment.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await connection();
  if (!isAdminEnabled()) notFound();
  if (!isAdminConfigured()) return <AdminSetupNotice />;
  await requireAdmin();
  return children;
}

function AdminSetupNotice() {
  return (
    <div className="max-w-xl rounded-card border border-line bg-white p-6">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Connect Supabase first</h1>
      <p className="mt-2 text-muted">
        The admin reads and writes through the Supabase secret key, which isn&apos;t set yet.
      </p>
      <ol className="mt-4 list-decimal space-y-1 pl-5">
        <li>Run the migration in <code>supabase/migrations</code> (see <code>docs/SUPABASE_SETUP.md</code>).</li>
        <li>Add <code>ADMIN_EMAILS=you@example.com</code> and create that user in Supabase → Authentication.</li>
        <li>
          Add <code>SUPABASE_SERVICE_ROLE_KEY=sb_secret_…</code> to <code>.env.local</code>.
        </li>
        <li>Restart <code>npm run dev</code>.</li>
      </ol>
    </div>
  );
}
