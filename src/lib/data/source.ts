import type { Car, CarFilters } from "@/lib/types";

/**
 * Everything the public site needs from storage. Two implementations:
 * seed (local demo data) and Supabase (Phase 3). Pages never import either
 * directly; they go through `@/lib/data/cars`.
 */
export interface CarSource {
  listCars(filters: CarFilters): Promise<Car[]>;
  getCarBySlug(slug: string): Promise<Car | null>;
  /** Every car including sold ones, unfiltered. Used for filter options and sitemap. */
  listAllCars(): Promise<Car[]>;
}
