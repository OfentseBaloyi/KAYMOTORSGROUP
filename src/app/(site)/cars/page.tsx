import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CarGrid } from "@/components/cars/car-grid";
import { InventoryFilters } from "@/components/cars/inventory-filters";
import { SortSelect } from "@/components/cars/sort-select";
import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { getCars, getFilterOptions } from "@/lib/data/cars";
import { parseFilters } from "@/lib/data/filters";
import { generalEnquiryLink } from "@/lib/messages";

export const metadata: Metadata = {
  title: "Cars for sale in Centurion & Pretoria",
  description: `Pre-owned cars for sale from ${siteConfig.legalName}. Filter by make, price, year and mileage. Viewings by appointment.`,
  alternates: { canonical: "/cars" },
};

export default function CarsPage({ searchParams }: PageProps<"/cars">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <SectionHeading as="h1">Cars for sale</SectionHeading>
      <p className="mt-4 max-w-xl text-muted">
        {siteConfig.sales.paymentSummary} {siteConfig.sales.viewingPolicy}
      </p>
      <Suspense fallback={<InventorySkeleton />}>
        <Inventory searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Inventory({ searchParams }: Pick<PageProps<"/cars">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const [cars, options] = await Promise.all([getCars(filters), getFilterOptions()]);

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
        <InventoryFilters filters={filters} options={options} resultCount={cars.length} />
      </aside>

      <section aria-label="Results" className="mt-4 lg:mt-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold" aria-live="polite">
            {cars.length} {cars.length === 1 ? "car" : "cars"}
            {!filters.includeSold && <span className="font-normal text-muted"> in stock</span>}
          </p>
          <SortSelect value={filters.sort} />
        </div>

        {cars.length > 0 ? (
          <CarGrid cars={cars} priorityCount={2} />
        ) : (
          <div className="rounded-card border border-line bg-white p-6 md:p-10">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
              Nothing matching right now.
            </h2>
            <p className="mt-2 max-w-md text-muted">
              WhatsApp us what you&apos;re looking for. Stock changes every week and we can keep an eye out for you.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={generalEnquiryLink}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("primary")}
              >
                <WhatsAppIcon size={18} /> WhatsApp us
              </a>
              <Link href="/cars" className={buttonClasses("outline")}>
                Clear filters
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="mt-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10" aria-busy="true">
      <div className="hidden h-96 rounded-card bg-sand lg:block" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-80 animate-pulse rounded-card bg-sand" />
        ))}
      </div>
    </div>
  );
}
