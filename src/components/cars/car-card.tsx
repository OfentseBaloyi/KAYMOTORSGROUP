import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/cars/status-badge";
import { cn } from "@/lib/cn";
import { formatMileage, formatPrice, fuelLabel, transmissionLabel } from "@/lib/format";
import { coverImageUrl } from "@/lib/images";
import type { Car } from "@/lib/types";

interface CarCardProps {
  car: Car;
  /** Set on the first row of cards so the LCP image isn't lazy-loaded. */
  priority?: boolean;
  headingLevel?: "h2" | "h3";
}

export function CarCard({ car, priority = false, headingLevel: Heading = "h3" }: CarCardProps) {
  const sold = car.status === "sold";

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-white transition-colors hover:border-navy-700">
      <div className="relative aspect-3/2 overflow-hidden bg-sand">
        <Image
          src={coverImageUrl(car)}
          alt={car.images[0]?.alt ?? ""}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className={cn(
            "object-cover transition-transform duration-300 group-hover:scale-[1.02]",
            sold && "grayscale",
          )}
          priority={priority}
        />
        {car.status !== "available" && (
          <StatusBadge status={car.status} className="absolute left-3 top-3" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Heading className="font-display text-xl leading-tight font-bold uppercase tracking-wide">
          <Link
            href={`/cars/${car.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {car.year} {car.make} {car.model}
          </Link>
        </Heading>
        {car.variant && <p className="mt-0.5 truncate text-sm text-muted">{car.variant}</p>}

        <p
          className={cn(
            "mt-3 font-display text-2xl font-bold",
            sold ? "text-muted" : "text-navy-950",
          )}
        >
          {formatPrice(car.price)}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-line pt-3 text-sm text-muted">
          <div>
            <dt className="sr-only">Mileage</dt>
            <dd>{formatMileage(car.mileageKm)}</dd>
          </div>
          <div>
            <dt className="sr-only">Year</dt>
            <dd>{car.year}</dd>
          </div>
          <div>
            <dt className="sr-only">Transmission</dt>
            <dd>{transmissionLabel[car.transmission]}</dd>
          </div>
          <div>
            <dt className="sr-only">Fuel</dt>
            <dd>{fuelLabel[car.fuelType]}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
