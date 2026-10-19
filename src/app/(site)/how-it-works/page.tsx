import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { generalEnquiryLink } from "@/lib/messages";

export const metadata: Metadata = {
  title: "How buying works",
  description:
    "How to buy a car from Kay Motors: book a viewing, test drive at an agreed place, pay cash/EFT or with your bank's finance, and drive away.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    title: "Find a car",
    body: "Browse the stock on this site or our Instagram. Price, mileage, history and features are all listed, so you know what you're looking at before you call.",
  },
  {
    title: "Book a viewing",
    body: "Send a viewing request or WhatsApp us. We'll confirm the car is still available and agree on a day, time and place that works for both of us.",
  },
  {
    title: "Inspect and test drive",
    body: "Meet us at the agreed spot. Take your time, check everything, and go for a test drive. You're welcome to bring a mechanic or have the car inspected.",
  },
  {
    title: "Sign the sale agreement",
    body: "Happy with it? We sign a written sale agreement with the agreed price and the car's details.",
  },
  {
    title: "Pay",
    body: `Cash or EFT, or through your own bank's vehicle finance. ${siteConfig.sales.financeNote}`,
  },
  {
    title: "Paperwork and handover",
    body: "Once the payment has cleared we hand over the keys, spare keys, service book and the papers you need to register the car in your name.",
  },
];

const safetyTips = [
  "Never pay a deposit or the full price before you've seen the car in person.",
  `Only deal with us on ${siteConfig.contact.phoneDisplay} and @${siteConfig.social.instagramHandle} on Instagram.`,
  "Scammers copy our photos and adverts. If the price looks too good or someone pushes you to pay quickly, check with us first.",
  "We'll never ask you to pay into a personal account belonging to someone you haven't met.",
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <SectionHeading as="h1">How buying works</SectionHeading>
      <p className="mt-4 max-w-xl text-lg text-muted">
        We don&apos;t have a showroom. Every car is shown by appointment, at a place we agree on.
        It keeps prices reasonable and means you get our full attention.
      </p>

      <ol className="mt-10 max-w-3xl">
        {steps.map((step, i) => (
          <li key={step.title} className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-t border-line py-6 md:grid-cols-[5rem_1fr]">
            <span className="font-display text-4xl leading-none font-bold text-orange-700 md:text-5xl" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{step.title}</h2>
              <p className="mt-1 max-w-prose text-lg leading-relaxed text-ink">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <section
        aria-labelledby="buy-safely"
        className="mt-12 max-w-3xl rounded-card border-l-4 border-orange-500 bg-white p-5 md:p-8"
      >
        <h2 id="buy-safely" className="flex items-center gap-2 font-display text-3xl font-bold uppercase tracking-wide">
          <TriangleAlert size={28} className="text-orange-700" aria-hidden="true" />
          Buy safely
        </h2>
        <ul className="mt-4 space-y-3">
          {safetyTips.map((tip) => (
            <li key={tip} className="flex gap-3 text-lg">
              <span className="mt-2.5 size-2 shrink-0 rounded-full bg-navy-950" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="good-to-know" className="mt-12 max-w-3xl">
        <h2 id="good-to-know" className="font-display text-2xl font-bold uppercase tracking-wide">
          Good to know
        </h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          <div className="py-4">
            <dt className="font-semibold">Do you do finance?</dt>
            <dd className="mt-1 text-muted">{siteConfig.sales.financeNote}</dd>
          </div>
          <div className="py-4">
            <dt className="font-semibold">Do you take trade-ins?</dt>
            <dd className="mt-1 text-muted">No, we don&apos;t take trade-ins. Sell your current car privately and come to us ready.</dd>
          </div>
          <div className="py-4">
            <dt className="font-semibold">Where are you based?</dt>
            <dd className="mt-1 text-muted">
              We&apos;re in {siteConfig.serviceAreaSummary}. Viewings happen at a place we agree on with you.
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/cars" className={buttonClasses("dark", "lg")}>
          See the cars
        </Link>
        <a href={generalEnquiryLink} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "lg")}>
          <WhatsAppIcon size={20} /> WhatsApp us
        </a>
      </div>
    </div>
  );
}
