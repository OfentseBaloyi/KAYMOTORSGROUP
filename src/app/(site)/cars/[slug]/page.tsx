import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { BOOKING_ANCHOR, CarActions, MobileActionBar } from "@/components/cars/car-actions";
import { CarGrid } from "@/components/cars/car-grid";
import { FeatureList, SpecGrid, TrustBadges } from "@/components/cars/car-specs";
import { Gallery } from "@/components/cars/gallery";
import { ShareButton } from "@/components/cars/share-button";
import { StatusBadge } from "@/components/cars/status-badge";
import { ViewingSection } from "@/components/viewing/viewing-section";
import { siteConfig } from "@/config/site";
import { getAllCars, getCarByOldSlug, getCarBySlug, getSimilarCars } from "@/lib/data/cars";
import { carTitle, formatMileage, formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";

// Cache Components needs at least one param at build time. With an empty
// database we hand it a placeholder that resolves to the 404 page.
const PLACEHOLDER_SLUG = "__placeholder__";

export async function generateStaticParams() {
  const cars = await getAllCars();
  return cars.length > 0 ? cars.map((car) => ({ slug: car.slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Car not found" };

  const title = `${carTitle(car)} for sale in Pretoria`;
  const description = `${formatPrice(car.price)} · ${formatMileage(car.mileageKm)} · ${car.colour ?? ""} ${car.engine ?? ""}. ${siteConfig.sales.viewingPolicy}`
    .replace(/\s+/g, " ")
    .trim();

  return {
    title,
    description,
    alternates: { canonical: `/cars/${car.slug}` },
    openGraph: { title, description, type: "website", url: `/cars/${car.slug}` },
  };
}

export default function CarPage({ params }: PageProps<"/cars/[slug]">) {
  return (
    <Suspense fallback={<CarDetailSkeleton />}>
      <CarDetail params={params} />
    </Suspense>
  );
}

async function CarDetail({ params }: Pick<PageProps<"/cars/[slug]">, "params">) {
  const { slug } = await params;
  const car = slug === PLACEHOLDER_SLUG ? null : await getCarBySlug(slug);
  if (!car) {
    // The title (and so the slug) may have been edited since the link was shared.
    const moved = slug === PLACEHOLDER_SLUG ? null : await getCarByOldSlug(slug);
    if (moved) permanentRedirect(`/cars/${moved.slug}`);
    notFound();
  }

  const title = carTitle(car);
  const sold = car.status === "sold";
  const similar = await getSimilarCars(car, 3);
  const images = car.images.map((img, i) => ({
    src: imageUrl(img.storagePath),
    alt: img.alt ?? `${title}, photo ${i + 1}`,
  }));

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-28 md:pt-6 lg:pb-16">
        <Link
          href="/cars"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted hover:text-navy-950"
        >
          <ArrowLeft size={16} aria-hidden="true" /> All cars
        </Link>

        {/* DOM order is gallery, price panel, details (right for phones).
            On desktop the panel moves to a sticky right column. */}
        <div className="mt-2 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-x-10">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <Gallery images={images} dimmed={sold} />
          </div>

          <aside
            className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
            aria-label="Price and actions"
          >
            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={car.status} />
              <span className="text-sm text-muted">Stock {car.stockNumber}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl leading-none font-bold uppercase tracking-wide text-navy-950 md:text-4xl">
              {car.year} {car.make} {car.model}
              {car.variant && (
                <span className="mt-1 block text-xl font-semibold normal-case tracking-normal text-muted md:text-2xl">
                  {car.variant}
                </span>
              )}
            </h1>
            <p className="mt-4 font-display text-4xl font-bold text-navy-950">{formatPrice(car.price)}</p>
            <p className="mt-1 text-sm text-muted">
              {formatMileage(car.mileageKm)} · {siteConfig.sales.paymentSummary}
            </p>

            {car.status === "reserved" && (
              <p className="mt-4 rounded-card border border-status-reserved/30 bg-orange-100 p-3 text-sm">
                <strong>Reserved.</strong> Another buyer has first option. WhatsApp us to go on the
                list in case it falls through.
              </p>
            )}

            <div className="mt-5">
              <CarActions car={car} />
            </div>
            <div className="mt-3">
              <ShareButton title={title} text={`${title} – ${formatPrice(car.price)}`} />
            </div>
          </aside>

          <div className="min-w-0 space-y-10 lg:col-start-1 lg:row-start-2 lg:pt-2">
            <section aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="mb-4 font-display text-2xl font-bold uppercase tracking-wide">
                Key specs
              </h2>
              <SpecGrid car={car} />
              <div className="mt-4">
                <TrustBadges car={car} />
              </div>
            </section>

            {car.features.length > 0 && (
              <section aria-labelledby="features-heading">
                <h2 id="features-heading" className="mb-4 font-display text-2xl font-bold uppercase tracking-wide">
                  Features
                </h2>
                <FeatureList features={car.features} />
              </section>
            )}

            {car.description && (
              <section aria-labelledby="description-heading">
                <h2 id="description-heading" className="mb-3 font-display text-2xl font-bold uppercase tracking-wide">
                  About this car
                </h2>
                <p className="max-w-prose whitespace-pre-line text-lg leading-relaxed">{car.description}</p>
              </section>
            )}

            {!sold && (
              <section id={BOOKING_ANCHOR} aria-labelledby="booking-heading" className="scroll-mt-24">
                <ViewingSection car={car} headingId="booking-heading" />
              </section>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="similar-heading" className="mt-16 border-t border-line pt-10">
            <h2 id="similar-heading" className="mb-6 font-display text-3xl font-bold uppercase tracking-wide">
              You might also like
            </h2>
            <CarGrid cars={similar} />
          </section>
        )}
      </div>

      <MobileActionBar car={car} />
    </>
  );
}

function CarDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 pb-16" aria-busy="true">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="aspect-3/2 animate-pulse rounded-card bg-sand" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 animate-pulse rounded-card bg-sand" />
          <div className="h-10 w-1/2 animate-pulse rounded-card bg-sand" />
          <div className="h-12 animate-pulse rounded-card bg-sand" />
        </div>
      </div>
    </div>
  );
}
