import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/brand-icons";
import { navLinks } from "@/components/layout/nav-links";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const { contact, social } = siteConfig;

  return (
    <footer className="mt-auto bg-sand">
      <div className="kombi-stripe" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src={siteConfig.brand.logo}
            alt={siteConfig.legalName}
            width={siteConfig.brand.logoWidth}
            height={siteConfig.brand.logoHeight}
            className="h-16 w-auto"
          />
          <p className="mt-4 max-w-xs text-muted">{siteConfig.tagline}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {siteConfig.sales.viewingPolicy}
          </p>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">Get in touch</h2>
          <ul className="mt-3 space-y-1">
            <li>
              <a
                href={siteConfig.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 hover:text-orange-700"
              >
                <WhatsAppIcon size={18} /> WhatsApp {contact.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 hover:text-orange-700">
                <Phone size={18} aria-hidden="true" /> {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex min-h-11 items-center gap-2 break-all hover:text-orange-700"
              >
                <Mail size={18} aria-hidden="true" /> {contact.email}
              </a>
            </li>
            <li>
              <a
                href={social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 hover:text-orange-700"
              >
                <InstagramIcon size={18} /> @{social.instagramHandle}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">Site</h2>
          <ul className="mt-3 space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center hover:text-orange-700">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Serving {siteConfig.serviceAreaSummary}.</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {siteConfig.legalName}</p>
          <p>{siteConfig.sales.paymentSummary} {siteConfig.sales.tradeInNote}</p>
        </div>
      </div>
    </footer>
  );
}
