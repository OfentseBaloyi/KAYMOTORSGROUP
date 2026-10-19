import { matchesFilters, sortCars } from "@/lib/data/filters";
import { SEED_CARS } from "@/lib/data/seed";
import type { CarSource } from "@/lib/data/source";

export const seedSource: CarSource = {
  async listCars(filters) {
    return sortCars(
      SEED_CARS.filter((car) => matchesFilters(car, filters)),
      filters.sort,
    );
  },
  async getCarBySlug(slug) {
    return SEED_CARS.find((car) => car.slug === slug) ?? null;
  },
  async getCarByStockNumber(stockNumber) {
    return SEED_CARS.find((car) => car.stockNumber.toLowerCase() === stockNumber.toLowerCase()) ?? null;
  },
  async listAllCars() {
    return SEED_CARS;
  },
};
