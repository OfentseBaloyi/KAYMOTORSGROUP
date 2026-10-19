import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { carEnquiryLink } from "@/lib/messages";
import type { Car } from "@/lib/types";

export const BOOKING_ANCHOR = "book-viewing";

/** WhatsApp + Book viewing, or the "it's gone" message for sold cars. */
export function CarActions({ car }: { car: Car }) {
  if (car.status === "sold") return <SoldNotice />;

  return (
    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
      <a
        href={carEnquiryLink(car)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses("primary", "lg", "flex-1")}
      >
        <WhatsAppIcon size={20} /> WhatsApp about this car
      </a>
      <a href={`#${BOOKING_ANCHOR}`} className={buttonClasses("dark", "lg", "flex-1")}>
        <CalendarDays size={20} aria-hidden="true" /> Book a viewing
      </a>
    </div>
  );
}

export function SoldNotice() {
  return (
    <div className="rounded-card border border-line bg-sand p-4">
      <p className="font-display text-xl font-bold uppercase tracking-wide">This one&apos;s gone.</p>
      <Link href="/cars" className="mt-1 inline-flex min-h-11 items-center font-semibold text-orange-700 hover:underline">
        See what&apos;s in stock
      </Link>
    </div>
  );
}

/** Sticky bottom bar on phones. Hidden on large screens where the side panel is visible. */
export function MobileActionBar({ car }: { car: Car }) {
  if (car.status === "sold") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={carEnquiryLink(car)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "lg")}
        >
          <WhatsAppIcon size={20} /> WhatsApp
        </a>
        <a href={`#${BOOKING_ANCHOR}`} className={buttonClasses("dark", "lg")}>
          <CalendarDays size={20} aria-hidden="true" /> Book viewing
        </a>
      </div>
    </div>
  );
}
