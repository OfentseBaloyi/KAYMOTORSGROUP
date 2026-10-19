import Image from "next/image";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks } from "@/components/layout/nav-links";
import { buttonClasses } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { generalEnquiryLink } from "@/lib/messages";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:h-20">
        <Link href="/" className="shrink-0" aria-label={`${siteConfig.name} home`}>
          <Image
            src={siteConfig.brand.logo}
            alt={siteConfig.legalName}
            width={siteConfig.brand.logoWidth}
            height={siteConfig.brand.logoHeight}
            className="h-11 w-auto md:h-14"
            priority
          />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center px-3 font-display text-lg font-semibold uppercase tracking-wide text-navy-950 hover:text-orange-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={generalEnquiryLink}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("primary", "md", "ml-auto md:ml-2")}
        >
          <WhatsAppIcon size={18} />
          <span>WhatsApp</span>
        </a>

        <MobileNav />
      </div>
    </header>
  );
}
