import { siteConfig, whatsappLink } from "@/config/site";
import { carTitle, formatDayDate, paymentReadinessLabel, timeSlotLabel } from "@/lib/format";
import type { Car, PaymentReadiness, TimeSlot } from "@/lib/types";

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

interface ViewingSummary {
  name: string;
  preferredDate: string;
  preferredTime: TimeSlot;
  paymentReadiness: PaymentReadiness;
  message?: string | null;
}

/** Visitor -> Kay Motors: the viewing request, as a WhatsApp message. */
export function viewingRequestLink(
  car: Pick<Car, "year" | "make" | "model" | "variant" | "stockNumber">,
  v: ViewingSummary,
) {
  const lines = [
    `Hi ${siteConfig.name}, I'd like to view the ${carTitle(car)} (Stock ${car.stockNumber}).`,
    `Name: ${v.name}`,
    `Preferred: ${formatDayDate(v.preferredDate)}, ${timeSlotLabel[v.preferredTime].toLowerCase()}`,
    `Payment: ${paymentReadinessLabel[v.paymentReadiness]}`,
  ];
  if (v.message) lines.push(`Note: ${v.message}`);
  return whatsappLink(lines.join("\n"));
}

/** Kay Motors -> buyer: confirm a viewing request on WhatsApp. */
export function viewingConfirmationLink(v: {
  name: string;
  phone: string;
  preferredDate: string;
  preferredTime: TimeSlot;
  car: Pick<Car, "year" | "make" | "model" | "variant" | "stockNumber"> | null;
}) {
  const firstName = v.name.trim().split(/\s+/)[0];
  const carText = v.car ? `the ${carTitle(v.car)} (Stock ${v.car.stockNumber})` : "the car";
  const text = [
    `Hi ${firstName}, it's ${siteConfig.legalName}.`,
    `Thanks for your viewing request for ${carText}.`,
    `Confirming ${formatDayDate(v.preferredDate)}, ${timeSlotLabel[v.preferredTime].toLowerCase()}. I'll send the exact time and meeting point here.`,
  ].join(" ");
  // wa.me wants the number without "+".
  return whatsappLink(text, v.phone.replace(/^\+/, ""));
}
