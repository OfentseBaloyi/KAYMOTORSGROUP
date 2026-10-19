import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { carEnquiryLink } from "@/lib/messages";
import type { Car } from "@/lib/types";

// Phase 2 placeholder. Phase 4 replaces this with the booking form.
export function ViewingSection({ car, headingId }: { car: Car; headingId: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-5 md:p-8">
      <h2 id={headingId} className="font-display text-2xl font-bold uppercase tracking-wide">
        Book a viewing
      </h2>
      <p className="mt-2 text-muted">{siteConfig.sales.viewingPolicy}</p>
      <a
        href={carEnquiryLink(car)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("primary", "lg", "mt-4")}
      >
        <WhatsAppIcon size={20} /> WhatsApp to book
      </a>
    </div>
  );
}
