import Image from "next/image";
import { siteConfig } from "@/config/site";
import { getCars, usingSeedData } from "@/lib/data/cars";
import { carTitle, formatMileage, formatPrice, statusLabel, transmissionLabel } from "@/lib/format";
import { coverImageUrl } from "@/lib/images";

// Phase 1 holding page: proves the brand setup and data layer work.
// Replaced by the real homepage in Phase 2.
export default async function HomePage() {
  const cars = await getCars({ includeSold: true });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Image
        src={siteConfig.brand.logo}
        alt={siteConfig.legalName}
        width={160}
        height={160}
        priority
      />
      <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-wide">
        In stock now
      </h1>
      <div className="kombi-stripe mt-2 w-24" aria-hidden="true" />
      <p className="mt-3 text-muted">{siteConfig.sales.viewingPolicy}</p>
      {usingSeedData() && (
        <p className="mt-2 text-sm text-orange-700">Showing demo stock (Supabase not connected).</p>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <li key={car.id} className="overflow-hidden rounded-card border border-line bg-white">
            <Image
              src={coverImageUrl(car)}
              alt={car.images[0]?.alt ?? carTitle(car)}
              width={600}
              height={400}
              className="aspect-3/2 w-full object-cover"
            />
            <div className="p-3">
              <p className="text-xs font-semibold uppercase text-muted">
                {car.stockNumber} · {statusLabel[car.status]}
              </p>
              <h2 className="font-display text-xl font-semibold">{carTitle(car)}</h2>
              <p className="text-lg font-semibold">{formatPrice(car.price)}</p>
              <p className="text-sm text-muted">
                {formatMileage(car.mileageKm)} · {transmissionLabel[car.transmission]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
