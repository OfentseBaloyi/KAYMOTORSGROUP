import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CaptionGenerator } from "@/components/admin/caption-generator";
import { CarForm } from "@/components/admin/car-form";
import { DeleteCarButton } from "@/components/admin/delete-car-button";
import { PhotoManager } from "@/components/admin/photo-manager";
import { StatusBadge } from "@/components/cars/status-badge";
import { buildInstagramCaption } from "@/config/instagram-caption";
import { adminGetCar } from "@/lib/admin/queries";
import { carTitle } from "@/lib/format";
import { imageUrl } from "@/lib/images";

export const metadata = { title: "Edit car" };

export default function EditCarPage(props: PageProps<"/admin/cars/[id]">) {
  return (
    <>
      <Link href="/admin/cars" className="inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-navy-950">
        ← Cars
      </Link>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <EditCar {...props} />
      </Suspense>
    </>
  );
}

async function EditCar({ params, searchParams }: PageProps<"/admin/cars/[id]">) {
  await connection();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const car = await adminGetCar(id);
  if (!car) notFound();

  const title = carTitle(car);
  const justSaved = query.saved === "1";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl leading-tight font-bold uppercase tracking-wide">{title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <StatusBadge status={car.status} /> Stock {car.stockNumber}
            <Link href={`/cars/${car.slug}`} target="_blank" className="inline-flex min-h-11 items-center gap-1 font-semibold text-orange-700 hover:underline">
              View on site <ExternalLink size={14} aria-hidden="true" />
            </Link>
          </p>
        </div>
        <DeleteCarButton id={car.id} label={title} redirectTo="/admin/cars" />
      </div>

      {justSaved && (
        <p role="status" className="mt-4 rounded-card border border-status-available/30 bg-white p-3 font-semibold text-status-available">
          Saved. {car.images.length === 0 && "Now add some photos."}
        </p>
      )}

      <section aria-labelledby="photos-heading" className="mt-6 rounded-card border border-line bg-white p-4 md:p-5">
        <h2 id="photos-heading" className="mb-3 font-display text-xl font-bold uppercase tracking-wide">
          Photos ({car.images.length})
        </h2>
        <PhotoManager
          carId={car.id}
          carLabel={title}
          initial={car.images.map((img) => ({ id: img.id, url: imageUrl(img.storagePath) }))}
        />
      </section>

      <section aria-labelledby="caption-heading" className="mt-6 rounded-card border border-line bg-white p-4 md:p-5">
        <h2 id="caption-heading" className="mb-3 font-display text-xl font-bold uppercase tracking-wide">
          Instagram caption
        </h2>
        <CaptionGenerator caption={buildInstagramCaption(car)} />
      </section>

      <h2 className="mt-10 mb-4 font-display text-2xl font-bold uppercase tracking-wide">Details</h2>
      {/* Key forces a fresh form after saving, so it shows what was stored. */}
      <CarForm key={car.updatedAt} car={car} />
    </>
  );
}
