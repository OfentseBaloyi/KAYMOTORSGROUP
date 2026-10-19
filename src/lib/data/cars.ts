import { seedSource } from "@/lib/data/seed-source";
import type { CarSource } from "@/lib/data/source";
import type { Car, CarFilters } from "@/lib/types";

/**
 * Public data access for cars. Every page imports from here.
 * Uses Supabase when its env vars are set, otherwise local seed data.
 */
function source(): CarSource {
  // TODO (Phase 3): `return isSupabaseConfigured() ? supabaseSource : seedSource;`
  return seedSource;
}

/** Lets the UI show a "demo data" notice while Supabase isn't connected. */
export function usingSeedData() {
  // TODO (Phase 3): becomes `!isSupabaseConfigured()` (from "@/lib/env").
  return true;
}

export function getCars(filters: CarFilters = {}) {
  return source().listCars(filters);
}

export function getCarBySlug(slug: string) {
  return source().getCarBySlug(slug);
}

/** Featured available/reserved cars first, then the newest ones, for "In stock now". */
export async function getInStockCars(limit = 6) {
  const cars = await source().listCars({ sort: "newest" });
  return [...cars].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, limit);
}

export async function getRecentlySold(limit = 4) {
  const cars = await source().listAllCars();
  return cars
    .filter((car) => car.status === "sold")
    .sort((a, b) => Date.parse(b.soldAt ?? b.updatedAt) - Date.parse(a.soldAt ?? a.updatedAt))
    .slice(0, limit);
}

/** Same body type or make first, then closest in price. Never includes sold cars. */
export async function getSimilarCars(car: Car, limit = 3) {
  const candidates = (await source().listCars({})).filter(
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

/** Distinct values for the inventory filter dropdowns. */
export async function getFilterOptions() {
  const cars = await source().listAllCars();
  const makes = [...new Set(cars.map((c) => c.make))].sort();
  const modelsByMake: Record<string, string[]> = {};
  for (const c of cars) {
    const models = (modelsByMake[c.make] ??= []);
    if (!models.includes(c.model)) models.push(c.model);
  }
  for (const make of makes) modelsByMake[make].sort();
  const years = cars.map((c) => c.year);
  return {
    makes,
    modelsByMake,
    minYear: years.length ? Math.min(...years) : undefined,
    maxYear: years.length ? Math.max(...years) : undefined,
  };
}
