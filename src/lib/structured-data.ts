import { siteConfig } from "@/config/site";
import { publicEnv } from "@/lib/env";
import { carTitle } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import type { Car } from "@/lib/types";

// schema.org JSON-LD. The business is a service-area dealer: no street
// address on purpose, just the areas served.

const dealerId = `${publicEnv.siteUrl}/#dealer`;

export function autoDealerJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": dealerId,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    description: siteConfig.description,
    url: publicEnv.siteUrl,
    logo: `${publicEnv.siteUrl}${siteConfig.brand.logoSquare}`,
    image: `${publicEnv.siteUrl}/opengraph-image.png`,
    telephone: "+27683301795",
    email: siteConfig.contact.email,
    areaServed: siteConfig.serviceAreas.map((name) => ({ "@type": "City", name })),
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.region.locality,
      addressRegion: siteConfig.region.province,
      addressCountry: siteConfig.region.country,
    },
    sameAs: [siteConfig.social.instagramUrl],
    paymentAccepted: "Cash, EFT, bank finance",
    currenciesAccepted: "ZAR",
  };
}

const availability = {
  available: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
} as const;

export function carJsonLd(car: Car) {
  const url = `${publicEnv.siteUrl}/cars/${car.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: carTitle(car),
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleModelDate: String(car.year),
    productionDate: String(car.year),
    sku: car.stockNumber,
    url,
    image: car.images.map((img) => {
      const src = imageUrl(img.storagePath);
      return src.startsWith("http") ? src : `${publicEnv.siteUrl}${src}`;
    }),
    description: car.description ?? undefined,
    color: car.colour ?? undefined,
    bodyType: car.bodyType,
    fuelType: car.fuelType,
    vehicleTransmission: car.transmission,
    vehicleEngine: car.engine ? { "@type": "EngineSpecification", name: car.engine } : undefined,
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileageKm, unitCode: "KMT" },
    numberOfPreviousOwners: car.owners ?? undefined,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      price: car.price,
      priceCurrency: "ZAR",
      availability: availability[car.status],
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@id": dealerId },
    },
  };
}

/** Serialises JSON-LD for a <script> tag, escaping "<" so it can't close the tag. */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
