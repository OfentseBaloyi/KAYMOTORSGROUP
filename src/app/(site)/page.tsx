import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CarGrid } from "@/components/cars/car-grid";
import { WhatsAppIcon } from "@/components/icons/brand-icons";
import { buttonClasses } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { getAllCars, getInStockCars, getRecentlySold, usingSeedData } from "@/lib/data/cars";
import { carTitle, formatDate } from "@/lib/format";
import { coverImageUrl } from "@/lib/images";
import { generalEnquiryLink } from "@/lib/messages";

const buyingSteps = [
  { title: "Pick a car", body: "Browse what's in stock. Every car has the price, mileage and history up front." },
  { title: "Book a viewing", body: "WhatsApp us or send a request. We'll agree on a time and place." },
  { title: "See it, drive it", body: "Inspect it properly and take it for a test drive. Bring your mechanic if you like." },
  { title: "Pay and drive", body: "Cash, EFT or your own bank's finance. We handle the paperwork with you." },
];

export default async function HomePage() {
  const [inStock, recentlySold, allCars] = await Promise.all([
    getInStockCars(6),
    getRecentlySold(4),
    getAllCars(),
  ]);
  const inStockTotal = allCars.filter((c) => c.status !== "sold").length;

  return (
    <>
      {/* Intro: kept short so cars show above the fold on a phone. */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-6 md:pt-12">
        <h1 className="max-w-2xl font-display text-4xl leading-[0.95] font-bold uppercase tracking-wide text-navy-950 md:text-6xl">
          Clean pre-owned cars.{" "}
          <span className="text-orange-700">Honest prices.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Independent dealer in {siteConfig.serviceAreaSummary}. {siteConfig.sales.viewingPolicy}
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-navy-950">
          <li>Cash / EFT deals</li>
          <li>Bank finance welcome</li>
          <li>No trade-ins</li>
        </ul>
      </section>

      <section aria-labelledby="in-stock" className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <SectionHeading id="in-stock">In stock now</SectionHeading>
          <Link
            href="/cars"
            className="inline-flex min-h-11 items-center gap-1 font-semibold text-orange-700 hover:underline"
          >
            All {inStockTotal} cars <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {usingSeedData() && (
          <p className="mb-4 rounded-card border border-dashed border-line bg-white px-3 py-2 text-sm text-muted">
            Demo stock shown. Real cars appear once the database is connected.
          </p>
        )}
        {inStock.length > 0 ? (
          <CarGrid cars={inStock} priorityCount={2} />
        ) : (
          <p className="text-muted">
            New stock is on the way. <a className="font-semibold text-orange-700 underline" href={generalEnquiryLink}>WhatsApp us</a> what you&apos;re after.
          </p>
        )}
      </section>

      <section aria-labelledby="how-buying-works" className="bg-navy-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <h2
                id="how-buying-works"
                className="font-display text-3xl leading-none font-bold uppercase tracking-wide md:text-4xl"
              >
                How buying from us works
              </h2>
              <p className="mt-4 text-white/80">
                No showroom, no pressure. Viewings are by appointment and for serious buyers only.
              </p>
              <Link
                href="/how-it-works"
                className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-orange-500 hover:underline"
              >
                The full process <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {buyingSteps.map((step, i) => (
                <li key={step.title} className="border-t border-white/20 pt-4">
                  <span className="font-display text-4xl leading-none font-bold text-orange-500" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-white/80">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {recentlySold.length > 0 && (
        <section aria-labelledby="recently-sold" className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading id="recently-sold">Recently sold</SectionHeading>
          <p className="mt-4 max-w-xl text-muted">
            Good cars don&apos;t stay long. Missed one? Tell us what you want and we&apos;ll keep an eye out.
          </p>
          <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
            {recentlySold.map((car) => (
              <li key={car.id} className="w-56 shrink-0 snap-start md:w-auto">
                <Link href={`/cars/${car.slug}`} className="group block">
                  <div className="relative aspect-3/2 overflow-hidden rounded-card bg-sand">
                    <Image
                      src={coverImageUrl(car)}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, 224px"
                      className="object-cover grayscale transition-opacity group-hover:opacity-90"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-status-sold/90 py-1 text-center font-display text-sm font-bold uppercase tracking-[0.2em] text-white">
                      Sold
                    </span>
                  </div>
                  <p className="mt-2 font-semibold leading-snug group-hover:underline">{carTitle(car)}</p>
                  {car.soldAt && (
                    <p className="text-sm text-muted">Sold {formatDate(car.soldAt)}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
              Looking for something specific?
            </h2>
            <p className="mt-1 text-muted">
              Send us the make, model and budget. We&apos;ll let you know when the right one comes in.
            </p>
          </div>
          <a
            href={generalEnquiryLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("primary", "lg", "shrink-0")}
          >
            <WhatsAppIcon size={20} /> WhatsApp us
          </a>
        </div>
      </section>
    </>
  );
}
