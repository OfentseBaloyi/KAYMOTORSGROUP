import type {
  BodyType,
  Car,
  CarStatus,
  FuelType,
  PaymentReadiness,
  TimeSlot,
  Transmission,
  ViewingStatus,
} from "@/lib/types";

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

export const timeSlotLabel: Record<TimeSlot, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export const paymentReadinessLabel: Record<PaymentReadiness, string> = {
  cash_ready: "Cash/EFT ready",
  finance_preapproved: "Bank finance pre-approved",
  arranging: "Still arranging",
};

export const viewingStatusLabel: Record<ViewingStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

/** "2026-10-21" -> "Tue 21 Oct 2026" (date-only strings, no timezone shift). */
export function formatDayDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** "+27683301795" -> "068 330 1795" */
export function formatSaPhone(e164: string) {
  const m = /^\+27(\d{2})(\d{3})(\d{4})$/.exec(e164);
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : e164;
}

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
