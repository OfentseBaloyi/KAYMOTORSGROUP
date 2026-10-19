import { Phone } from "lucide-react";
import Link from "next/link";
import { ViewingStatusSelect } from "@/components/admin/viewing-status-select";
import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import type { AdminViewingRequest } from "@/lib/admin/queries";
import { cn } from "@/lib/cn";
import {
  carTitle,
  formatDate,
  formatDayDate,
  formatSaPhone,
  paymentReadinessLabel,
  timeSlotLabel,
} from "@/lib/format";
import { viewingConfirmationLink } from "@/lib/messages";
import type { PaymentReadiness } from "@/lib/types";

const readinessStyle: Record<PaymentReadiness, string> = {
  cash_ready: "bg-status-available text-white",
  finance_preapproved: "bg-navy-950 text-white",
  arranging: "bg-sand text-navy-950",
};

export function ViewingRequestList({ requests }: { requests: AdminViewingRequest[] }) {
  if (requests.length === 0) {
    return <p className="rounded-card border border-dashed border-line bg-white p-4 text-muted">No requests yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li key={r.id} className="rounded-card border border-line bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold">{r.name}</p>
              <a href={`tel:${r.phone}`} className="inline-flex min-h-11 items-center gap-1 text-muted hover:text-navy-950">
                <Phone size={16} aria-hidden="true" /> {formatSaPhone(r.phone)}
              </a>
            </div>
            <span className={cn("rounded-sm px-2 py-0.5 text-sm font-semibold", readinessStyle[r.paymentReadiness])}>
              {paymentReadinessLabel[r.paymentReadiness]}
            </span>
          </div>

          <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Car</dt>
              <dd className="font-semibold">
                {r.car ? (
                  <Link href={`/admin/cars/${r.car.id}`} className="hover:underline">
                    {carTitle(r.car)} · {r.car.stockNumber}
                    {r.car.status === "sold" && <span className="text-status-sold"> (sold)</span>}
                  </Link>
                ) : (
                  "Car removed"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Wants</dt>
              <dd className="font-semibold">
                {formatDayDate(r.preferredDate)}, {timeSlotLabel[r.preferredTime].toLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Received</dt>
              <dd>{formatDate(r.createdAt)}</dd>
            </div>
          </dl>

          {r.message && <p className="mt-2 rounded-sm bg-paper p-2 text-sm whitespace-pre-line">{r.message}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ViewingStatusSelect id={r.id} status={r.status} />
            <a
              href={viewingConfirmationLink(r)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("primary")}
            >
              <WhatsAppIcon size={18} /> Confirm on WhatsApp
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
