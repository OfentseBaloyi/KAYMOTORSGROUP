import { cacheLife, cacheTag } from "next/cache";
import { seedSource } from "@/lib/data/seed-source";
import type { CarSource } from "@/lib/data/source";
import type { Car, CarFilters } from "@/lib/types";

/**
 * Public data access for cars. Every page imports from here.
 * Uses Supabase when its env vars are set, otherwise local seed data.
 *
 * Reads are cached ('use cache') and tagged CARS_TAG. Admin changes call
 * updateTag(CARS_TAG) so the public site updates immediately; the hourly
 * lifetime is a safety net for edits made directly in the Supabase dashboard.
 */
export const CARS_TAG = "cars";

function source(): CarSource {
  // TODO (Phase 3): `return isSupabaseConfigured() ? supabaseSource : seedSource;`
  return seedSource;
}

/** Lets the UI show a "demo data" notice while Supabase isn't connected. */
export function usingSeedData() {
  // TODO (Phase 3): becomes `!isSupabaseConfigured()` (from "@/lib/env").
  return true;
}

export async function getCars(filters: CarFilters = {}) {
  "use cache";
  cacheTag(CARS_TAG);
  cacheLife("hours");
  return source().listCars(filters);
}

export async function getAllCars() {
  "use cache";
  cacheTag(CARS_TAG);
  cacheLife("hours");
  return source().listAllCars();
}

export async function getCarBySlug(slug: string) {
  "use cache";
  cacheTag(CARS_TAG);
  cacheLife("hours");
  return source().getCarBySlug(slug);
}

/** Featured cars first, then the newest, for "In stock now". Excludes sold. */
export async function getInStockCars(limit = 6) {
  const cars = await getCars({ sort: "newest" });
  return [...cars].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, limit);
}

export async function getRecentlySold(limit = 4) {
  const cars = await getAllCars();
  return cars
    .filter((car) => car.status === "sold")
    .sort((a, b) => Date.parse(b.soldAt ?? b.updatedAt) - Date.parse(a.soldAt ?? a.updatedAt))
    .slice(0, limit);
}

/** Same body type or make first, then closest in price. Only available cars. */
export async function getSimilarCars(car: Car, limit = 3) {
  const candidates = (await getCars({})).filter(
    (c) => c.id !== car.id && c.status === "available",
  );
  const score = (c: Car) =>
    (c.bodyType === car.bodyType ? 0 : 1) + (c.make === car.make ? 0 : 0.5);
  return candidates
    .sort(
      (a, b) =>
        score(a) - score(b) || Math.abs(a.price - car.price) - Math.abs(b.price - car.price),
    )
    .slice(0, limit);
}

export interface FilterOptions {
  makes: string[];
  modelsByMake: Record<string, string[]>;
  years: number[];
}

/** Distinct values for the inventory filter dropdowns. */
export async function getFilterOptions(): Promise<FilterOptions> {
  const cars = await getAllCars();
  const makes = [...new Set(cars.map((c) => c.make))].sort();
  const modelsByMake: Record<string, string[]> = {};
  for (const c of cars) {
    const models = (modelsByMake[c.make] ??= []);
    if (!models.includes(c.model)) models.push(c.model);
  }
  for (const make of makes) modelsByMake[make].sort();
  const years = [...new Set(cars.map((c) => c.year))].sort((a, b) => b - a);
  return { makes, modelsByMake, years };
}
