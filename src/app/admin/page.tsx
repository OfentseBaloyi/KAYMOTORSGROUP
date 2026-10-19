import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ViewingRequestList } from "@/components/admin/viewing-request-list";
import { buttonClasses } from "@/components/ui/button";
import { adminDashboardStats, adminListViewingRequests } from "@/lib/admin/queries";

export const metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Dashboard</h1>
        <Link href="/admin/cars/new" className={buttonClasses("primary")}>
          Add a car
        </Link>
      </div>
      <Suspense fallback={<p className="mt-6 text-muted">Loading…</p>}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await connection(); // Always fresh: never prerender admin data.
  const [stats, latest] = await Promise.all([adminDashboardStats(), adminListViewingRequests(5)]);

  const tiles = [
    { label: "Available", value: stats.available, href: "/admin/cars" },
    { label: "Reserved", value: stats.reserved, href: "/admin/cars" },
    { label: "Sold this month", value: stats.soldThisMonth, href: "/admin/cars" },
    { label: "New viewing requests", value: stats.newRequests, href: "/admin/viewings", highlight: stats.newRequests > 0 },
  ];

  return (
    <>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={
              t.highlight
                ? "rounded-card border-2 border-orange-500 bg-white p-4 hover:bg-orange-100"
                : "rounded-card border border-line bg-white p-4 hover:border-navy-700"
            }
          >
            <dt className="text-sm font-semibold text-muted">{t.label}</dt>
            <dd className="mt-1 font-display text-4xl font-bold">{t.value}</dd>
          </Link>
        ))}
      </dl>

      <section className="mt-10" aria-labelledby="latest-requests">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="latest-requests" className="font-display text-2xl font-bold uppercase tracking-wide">
            Latest viewing requests
          </h2>
          <Link href="/admin/viewings" className="inline-flex min-h-11 items-center font-semibold text-orange-700 hover:underline">
            All requests
          </Link>
        </div>
        <ViewingRequestList requests={latest} />
      </section>
    </>
  );
}
