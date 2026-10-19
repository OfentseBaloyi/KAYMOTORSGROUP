import { connection } from "next/server";
import { Suspense } from "react";
import { ViewingRequestList } from "@/components/admin/viewing-request-list";
import { adminListViewingRequests, sortByReadiness } from "@/lib/admin/queries";

export const metadata = { title: "Viewing requests" };

export default function AdminViewingsPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Viewing requests</h1>
      <p className="mt-1 text-muted">Most ready buyers first: Cash/EFT, then pre-approved finance, then still arranging.</p>
      <Suspense fallback={<p className="mt-6 text-muted">Loading…</p>}>
        <Requests />
      </Suspense>
    </>
  );
}

async function Requests() {
  await connection();
  const all = await adminListViewingRequests();
  const open = sortByReadiness(all.filter((r) => r.status === "new" || r.status === "confirmed"));
  const closed = all.filter((r) => r.status !== "new" && r.status !== "confirmed");

  return (
    <>
      <section className="mt-6" aria-labelledby="open-requests">
        <h2 id="open-requests" className="mb-3 font-display text-xl font-bold uppercase tracking-wide">
          Open ({open.length})
        </h2>
        <ViewingRequestList requests={open} />
      </section>
      {closed.length > 0 && (
        <details className="mt-10">
          <summary className="min-h-11 cursor-pointer font-display text-xl font-bold uppercase tracking-wide">
            Completed, no-show and cancelled ({closed.length})
          </summary>
          <div className="mt-3">
            <ViewingRequestList requests={closed} />
          </div>
        </details>
      )}
    </>
  );
}
