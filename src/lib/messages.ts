import { siteConfig, whatsappLink } from "@/config/site";
import { carTitle } from "@/lib/format";
import type { Car } from "@/lib/types";

/** Prefilled WhatsApp text for a car enquiry. */
export function carEnquiryMessage(car: Pick<Car, "year" | "make" | "model" | "variant" | "stockNumber">) {
  return `Hi ${siteConfig.name}, I'm interested in the ${carTitle(car)} (Stock ${car.stockNumber}). Is it still available?`;
}

export function carEnquiryLink(car: Parameters<typeof carEnquiryMessage>[0]) {
  return whatsappLink(carEnquiryMessage(car));
}

export const generalEnquiryLink = whatsappLink(
  `Hi ${siteConfig.name}, I'm looking for a car. Can you help?`,
);
