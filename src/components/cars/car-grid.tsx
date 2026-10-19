import { CarCard } from "@/components/cars/car-card";
import type { Car } from "@/lib/types";

interface CarGridProps {
  cars: Car[];
  priorityCount?: number;
  /** Card heading level, so headings stay in order on each page. */
  headingLevel?: "h2" | "h3";
}

export function CarGrid({ cars, priorityCount = 0, headingLevel = "h3" }: CarGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car, i) => (
        <li key={car.id} className="flex">
          <CarCard car={car} priority={i < priorityCount} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
