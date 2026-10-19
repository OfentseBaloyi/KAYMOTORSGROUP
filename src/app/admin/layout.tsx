import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AdminNav, AdminNavList } from "@/components/admin/admin-nav";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/admin/require-admin";
import { isAdminConfigured } from "@/lib/supabase/admin-client";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | ${siteConfig.name} admin` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper">
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
          <Link href="/" className="ml-auto inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-navy-950">
            View site
          </Link>
        </div>
      </header>

      {/* TODO: add Supabase Auth — remove this banner once login exists. */}
      <p className="bg-orange-100 px-4 py-2 text-center text-sm text-navy-950">
        No login yet. The admin only works in development until Supabase Auth is added.
      </p>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:py-8">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </main>
    </div>
  );
}

/**
 * Runs per request (never at build time), so the ADMIN_ENABLED switch and the
 * secret-key check reflect the live environment.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await connection();
  await requireAdmin();
  return isAdminConfigured() ? children : <AdminSetupNotice />;
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
        <li>
          Add <code>SUPABASE_SERVICE_ROLE_KEY=sb_secret_…</code> to <code>.env.local</code>.
        </li>
        <li>Restart <code>npm run dev</code>.</li>
      </ol>
    </div>
  );
}
