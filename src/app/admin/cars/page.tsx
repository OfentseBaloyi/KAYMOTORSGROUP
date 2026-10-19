import { Pencil, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CarStatusSelect } from "@/components/admin/car-status-select";
import { DeleteCarButton } from "@/components/admin/delete-car-button";
import { buttonClasses } from "@/components/ui/button";
import { adminListCars } from "@/lib/admin/queries";
import { carTitle, formatDate, formatMileage, formatPrice } from "@/lib/format";
import { coverImageUrl } from "@/lib/images";

export const metadata = { title: "Cars" };

export default function AdminCarsPage({ searchParams }: PageProps<"/admin/cars">) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Cars</h1>
        <Link href="/admin/cars/new" className={buttonClasses("primary")}>
          Add a car
        </Link>
      </div>
      <Suspense fallback={<p className="mt-6 text-muted">Loading…</p>}>
        <CarsList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function CarsList({ searchParams }: Pick<PageProps<"/admin/cars">, "searchParams">) {
  await connection();
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 50) ?? "";
  const cars = await adminListCars(q);

  return (
    <>
      <form action="/admin/cars" className="mt-4 flex max-w-md gap-2" role="search">
        <label htmlFor="admin-car-search" className="sr-only">Search cars</label>
        <input
          id="admin-car-search"
          name="q"
          defaultValue={q}
          placeholder="Make, model, stock no…"
          className="min-h-11 flex-1 rounded-card border border-line bg-white px-3"
        />
        <button type="submit" className={buttonClasses("dark")} aria-label="Search">
          <Search size={18} aria-hidden="true" />
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {cars.length} {cars.length === 1 ? "car" : "cars"}
        {q && <> matching &ldquo;{q}&rdquo; · <Link href="/admin/cars" className="underline">clear</Link></>}
      </p>

      {cars.length === 0 ? (
        <p className="mt-4 rounded-card border border-dashed border-line bg-white p-6 text-muted">
          {q ? "No cars match that search." : "No cars yet. Add your first one."}
        </p>
      ) : (
        <>
          {/* Phones: cards */}
          <ul className="mt-3 space-y-3 md:hidden">
            {cars.map((car) => (
              <li key={car.id} className="rounded-card border border-line bg-white p-3">
                <div className="flex gap-3">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm bg-sand">
                    <Image src={coverImageUrl(car)} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{carTitle(car)}</p>
                    <p className="text-sm text-muted">
                      {car.stockNumber} · {formatPrice(car.price)} · {formatMileage(car.mileageKm)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CarStatusSelect id={car.id} status={car.status} label={carTitle(car)} />
                  <Link href={`/admin/cars/${car.id}`} className={buttonClasses("outline", "md", "ml-auto")}>
                    <Pencil size={16} aria-hidden="true" /> Edit
                  </Link>
                  <DeleteCarButton id={car.id} label={carTitle(car)} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="mt-3 hidden overflow-x-auto rounded-card border border-line bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-sand text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-3 py-2">Car</th>
                  <th scope="col" className="px-3 py-2">Stock</th>
                  <th scope="col" className="px-3 py-2 text-right">Price</th>
                  <th scope="col" className="px-3 py-2 text-right">Mileage</th>
                  <th scope="col" className="px-3 py-2">Added</th>
                  <th scope="col" className="px-3 py-2">Status</th>
                  <th scope="col" className="px-3 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-sm bg-sand">
                          <Image src={coverImageUrl(car)} alt="" fill sizes="64px" className="object-cover" />
                        </div>
                        <div>
                          <Link href={`/admin/cars/${car.id}`} className="font-semibold hover:underline">
                            {car.year} {car.make} {car.model}
                          </Link>
                          {car.variant && <p className="text-muted">{car.variant}</p>}
                          {car.isFeatured && <p className="text-xs font-semibold text-orange-700">Featured</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">{car.stockNumber}</td>
                    <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">{formatPrice(car.price)}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">{formatMileage(car.mileageKm)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(car.createdAt)}</td>
                    <td className="px-3 py-2">
                      <CarStatusSelect id={car.id} status={car.status} label={carTitle(car)} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/cars/${car.id}`} className={buttonClasses("ghost")}>
                          Edit
                        </Link>
                        <DeleteCarButton id={car.id} label={carTitle(car)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
