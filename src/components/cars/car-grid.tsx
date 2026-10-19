import { CarCard } from "@/components/cars/car-card";
import type { Car } from "@/lib/types";

export function CarGrid({ cars, priorityCount = 0 }: { cars: Car[]; priorityCount?: number }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car, i) => (
        <li key={car.id} className="flex">
          <CarCard car={car} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
