/**
 * Every business detail for Kay Motors Group lives here.
 * Edit this file (not the components) when the client's details change.
 */

const whatsappNumber = "27683301795";

export const siteConfig = {
  name: "Kay Motors",
  legalName: "Kay Motors Group (Pty) Ltd",
  tagline: "Immaculate pre-owned vehicles at reasonable prices.",
  description:
    "Independent pre-owned car seller in Centurion and Pretoria. Viewings by appointment, cash/EFT deals, bank finance buyers welcome.",

  // Used for canonical URLs, sitemap and Open Graph. Overridden by NEXT_PUBLIC_SITE_URL.
  url: "https://kaymotorsgroup.co.za",
  domain: "kaymotorsgroup.co.za",

  contact: {
    phoneDisplay: "068 330 1795",
    phoneHref: "tel:+27683301795",
    whatsappDisplay: "+27 68 330 1795",
    whatsappNumber,
    whatsappUrl: `https://wa.me/${whatsappNumber}`,
    email: "kaymotorsgroup@gmail.com",
  },

  social: {
    instagramHandle: "kaymotorsgroup_",
    instagramUrl: "https://instagram.com/kaymotorsgroup_",
  },

  // No street address on purpose: there is no showroom.
  serviceAreas: ["Centurion", "Pretoria"],
  serviceAreaSummary: "Centurion, Pretoria and surrounds",
  region: { locality: "Centurion", province: "Gauteng", country: "ZA" },

  sales: {
    viewingPolicy: "Viewings by appointment. WhatsApp us to arrange a time and place.",
    seriousBuyersNote:
      "Viewings are for serious buyers only. No casual viewings, no joyrides.",
    paymentSummary: "Cash / EFT deals. Bank finance buyers welcome.",
    // TODO: confirm with client — which banks/finance houses to name publicly.
    financePartnersMentioned: ["Capitec", "MotoData Vehicle Finance"],
    // TODO: confirm with client — exact finance wording.
    financeNote:
      "We don't offer in-house finance. If you're financing through your own bank, get pre-approved first and we'll work with them.",
    tradeIns: false,
    tradeInNote: "We don't take trade-ins.",
  },

  brand: {
    // Transparent PNG. The navy lettering disappears on dark backgrounds,
    // so only place it on white/paper/sand surfaces.
    logo: "/brand/kay-motors-logo.png",
    logoWidth: 349,
    logoHeight: 191,
    // Square, white-background version (used for Open Graph / JSON-LD).
    logoSquare: "/brand/kay-motors-logo.jpg",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Builds a wa.me link with an optional prefilled message. */
export function whatsappLink(message?: string, number: string = whatsappNumber) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
