import { siteConfig } from "@/config/site";
import { carTitle, formatMileage, formatPrice, fuelLabel, transmissionLabel } from "@/lib/format";
import type { Car } from "@/lib/types";

/**
 * Instagram caption in Kay Motors' own posting style.
 * Edit the wording here. Emojis are deliberate: they match his posts.
 * (The website UI itself never uses emojis.)
 */
type CaptionCar = Pick<
  Car,
  | "year" | "make" | "model" | "variant" | "price" | "mileageKm" | "transmission"
  | "fuelType" | "engine" | "owners" | "serviceHistory" | "accidentFree"
  | "spareKeys" | "papersInOrder" | "features" | "slug"
>;

const TICK = "✅";

/** "service history with books" -> "Service History With Books" */
function titleCase(value: string) {
  return value.replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

export function buildInstagramCaption(car: CaptionCar) {
  // Ticked highlights: the checklist features plus the trust flags, no duplicates.
  const highlights = new Set<string>();
  if (car.owners === 1 && !car.features.some((f) => /one owner/i.test(f))) {
    highlights.add("One Owner");
  }
  for (const f of car.features) highlights.add(f);
  if (car.serviceHistory && ![...highlights].some((f) => /service history/i.test(f))) {
    highlights.add("Service History");
  }
  if (car.accidentFree) highlights.add("Accident Free");
  if (car.spareKeys) highlights.add("Spare Keys");
  if (car.papersInOrder) highlights.add("Papers In Order");

  const dedup = new Map<string, string>();
  for (const h of highlights) dedup.set(h.toLowerCase(), titleCase(h));

  const lines = [
    `${carTitle(car)} 🔥`,
    "",
    ...[...dedup.values()].map((h) => `- ${h} ${TICK}`),
    `- Only ${formatMileage(car.mileageKm)}`,
    `- ${transmissionLabel[car.transmission]} Transmission`,
    car.engine ? `- ${car.engine}` : `- ${fuelLabel[car.fuelType]}`,
    "",
    formatPrice(car.price),
    "",
    "NB‼️ Viewing on appointment only. No casual viewing without intention to buy, no time wasters, no joyrides whatsoever.",
    "",
    `CASH/EFT DEALS ${TICK}  No Trade-ins`,
    `📍 Pretoria / Centurion`,
    "",
    `Call/WhatsApp ☎️ ${siteConfig.legalName}`,
    siteConfig.contact.phoneDisplay,
    `🔗 ${siteConfig.domain}/cars/${car.slug}`,
  ];

  return lines.join("\n");
}
