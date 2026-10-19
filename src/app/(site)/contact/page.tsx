import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { generalEnquiryLink } from "@/lib/messages";

export const metadata: Metadata = {
  title: "Contact",
  description: `WhatsApp, call or email ${siteConfig.legalName}. Serving ${siteConfig.serviceAreaSummary}. Viewings by appointment.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact, social } = siteConfig;

  const channels = [
    {
      label: "WhatsApp",
      value: contact.whatsappDisplay,
      href: generalEnquiryLink,
      external: true,
      Icon: WhatsAppIcon,
      note: "Fastest way to reach us.",
    },
    { label: "Call", value: contact.phoneDisplay, href: contact.phoneHref, Icon: Phone },
    { label: "Email", value: contact.email, href: `mailto:${contact.email}`, Icon: Mail },
    {
      label: "Instagram",
      value: `@${social.instagramHandle}`,
      href: social.instagramUrl,
      external: true,
      Icon: InstagramIcon,
      note: "New stock goes up here first.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <SectionHeading as="h1">Contact</SectionHeading>

      <div className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="max-w-lg text-lg">
            WhatsApp is the quickest. Tell us which car you&apos;re interested in, or what you&apos;re looking for.
          </p>
          <a
            href={generalEnquiryLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("primary", "lg", "mt-5")}
          >
            <WhatsAppIcon size={20} /> Chat on WhatsApp
          </a>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {channels.map(({ label, value, href, external, Icon, note }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex min-h-16 items-center gap-4 py-3"
                >
                  <Icon size={22} className="shrink-0 text-orange-700" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold uppercase tracking-wider text-muted">{label}</span>
                    <span className="block text-lg font-semibold break-words group-hover:underline">{value}</span>
                    {note && <span className="block text-sm text-muted">{note}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="viewings" className="rounded-card bg-navy-950 p-6 text-white">
            <h2 id="viewings" className="font-display text-2xl font-bold uppercase tracking-wide">
              Viewings by appointment
            </h2>
            <p className="mt-2 text-white/85">
              We don&apos;t have a showroom. Once you&apos;ve chosen a car, we&apos;ll agree on a time and a place
              to meet. {siteConfig.sales.seriousBuyersNote}
            </p>
          </section>

          <section aria-labelledby="areas">
            <h2 id="areas" className="font-display text-2xl font-bold uppercase tracking-wide">
              Where we operate
            </h2>
            <p className="mt-2 text-muted">{siteConfig.serviceAreaSummary}.</p>
          </section>

          <section aria-labelledby="payment">
            <h2 id="payment" className="font-display text-2xl font-bold uppercase tracking-wide">
              Payment
            </h2>
            <p className="mt-2 text-muted">
              {siteConfig.sales.paymentSummary} {siteConfig.sales.tradeInNote}
            </p>
          </section>

          <p className="text-sm text-muted">{siteConfig.legalName}</p>
        </div>
      </div>
    </div>
  );
}
