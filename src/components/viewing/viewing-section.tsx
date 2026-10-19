import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { ViewingForm } from "@/components/viewing/viewing-form";
import { siteConfig } from "@/config/site";
import { carEnquiryLink } from "@/lib/messages";
import type { Car } from "@/lib/types";

export function ViewingSection({ car, headingId }: { car: Car; headingId: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 md:p-8">
      <h2 id={headingId} className="font-display text-2xl font-bold uppercase tracking-wide">
        Book a viewing
      </h2>
      <p className="mt-2 max-w-prose text-muted">
        {siteConfig.sales.viewingPolicy} Or send a request here and we&apos;ll get back to you.
      </p>
      <div className="mt-6">
        <ViewingForm
          car={{
            id: car.id,
            year: car.year,
            make: car.make,
            model: car.model,
            variant: car.variant,
            stockNumber: car.stockNumber,
          }}
        />
      </div>
      <p className="mt-6 border-t border-line pt-4 text-sm text-muted">
        Prefer to chat?{" "}
        <a
          href={carEnquiryLink(car)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1 font-semibold text-orange-700 hover:underline"
        >
          <WhatsAppIcon size={16} /> WhatsApp us about this car
        </a>
      </p>
    </div>
  );
}
