import type { BodyType, Car, CarStatus, FuelType, Transmission } from "@/lib/types";

const numberFormat = new Intl.NumberFormat("en-ZA", { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

// en-ZA uses a non-breaking space as the thousands separator. Normalise to a
// plain space so captions and WhatsApp messages copy cleanly.
function group(value: number) {
  return numberFormat.format(value).replace(/[  ]/g, " ");
}

/** 189900 -> "R 189 900" */
export function formatPrice(rands: number) {
  return `R ${group(rands)}`;
}

/** 142000 -> "142 000 km" */
export function formatMileage(km: number) {
  return `${group(km)} km`;
}

/** ISO string -> "19 Oct 2026" */
export function formatDate(value: string | Date) {
  return dateFormat.format(typeof value === "string" ? new Date(value) : value);
}

export const transmissionLabel: Record<Transmission, string> = {
  manual: "Manual",
  automatic: "Automatic",
};

export const fuelLabel: Record<FuelType, string> = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  electric: "Electric",
};

export const bodyTypeLabel: Record<BodyType, string> = {
  hatchback: "Hatchback",
  sedan: "Sedan",
  suv: "SUV",
  bakkie: "Bakkie",
  mpv: "MPV",
  coupe: "Coupé",
  other: "Other",
};

export const statusLabel: Record<CarStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

/** "2019 Volkswagen Polo 1.0 TSI Highline" */
export function carTitle(car: Pick<Car, "year" | "make" | "model" | "variant">) {
  return [car.year, car.make, car.model, car.variant].filter(Boolean).join(" ");
}

/** "2019-volkswagen-polo-1-0-tsi-highline-km023" */
export function carSlug(car: Pick<Car, "year" | "make" | "model" | "variant" | "stockNumber">) {
  return `${carTitle(car)} ${car.stockNumber}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
