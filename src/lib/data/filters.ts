import { z } from "zod";
import {
  BODY_TYPES,
  FUEL_TYPES,
  SORT_OPTIONS,
  TRANSMISSIONS,
  type Car,
  type CarFilters,
} from "@/lib/types";

// Bad or tampered URL values are dropped (`.catch(undefined)`) instead of
// throwing, so a broken shared link still shows the inventory.
// Empty strings (e.g. "Any" in a select) are treated as "not set".
const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);
const optionalInt = z
  .preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional())
  .catch(undefined);
const optionalText = z
  .string()
  .trim()
  .max(50)
  .transform((v) => v || undefined)
  .optional()
  .catch(undefined);

const filtersSchema = z.object({
  make: optionalText,
  model: optionalText,
  minPrice: optionalInt,
  maxPrice: optionalInt,
  minYear: optionalInt,
  maxYear: optionalInt,
  maxMileage: optionalInt,
  transmission: z.enum(TRANSMISSIONS).optional().catch(undefined),
  fuelType: z.enum(FUEL_TYPES).optional().catch(undefined),
  bodyType: z.enum(BODY_TYPES).optional().catch(undefined),
  includeSold: z
    .string()
    .optional()
    .transform((v) => v === "1" || v === "true" || undefined)
    .catch(undefined),
  sort: z.enum(SORT_OPTIONS).optional().catch(undefined),
});

type RawSearchParams = Record<string, string | string[] | undefined>;

/** Parses Next.js `searchParams` into typed filters. */
export function parseFilters(searchParams: RawSearchParams): CarFilters {
  const flat = Object.fromEntries(
    Object.entries(searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  return filtersSchema.parse(flat);
}

/** Inverse of parseFilters, for building shareable /cars?… links. */
export function filtersToSearchParams(filters: CarFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === false || value === "") continue;
    params.set(key, value === true ? "1" : String(value));
  }
  return params;
}

const sameText = (a: string, b: string) => a.localeCompare(b, "en", { sensitivity: "base" }) === 0;

export function matchesFilters(car: Car, f: CarFilters) {
  if (!f.includeSold && car.status === "sold") return false;
  if (f.make && !sameText(car.make, f.make)) return false;
  if (f.model && !sameText(car.model, f.model)) return false;
  if (f.minPrice !== undefined && car.price < f.minPrice) return false;
  if (f.maxPrice !== undefined && car.price > f.maxPrice) return false;
  if (f.minYear !== undefined && car.year < f.minYear) return false;
  if (f.maxYear !== undefined && car.year > f.maxYear) return false;
  if (f.maxMileage !== undefined && car.mileageKm > f.maxMileage) return false;
  if (f.transmission && car.transmission !== f.transmission) return false;
  if (f.fuelType && car.fuelType !== f.fuelType) return false;
  if (f.bodyType && car.bodyType !== f.bodyType) return false;
  return true;
}

export function sortCars(cars: Car[], sort: CarFilters["sort"] = "newest") {
  const sorted = [...cars];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "mileage_asc":
      return sorted.sort((a, b) => a.mileageKm - b.mileageKm);
    case "newest":
    default:
      return sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }
}
