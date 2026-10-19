import { publicEnv } from "@/lib/env";
import type { Car, CarImage } from "@/lib/types";

export const CAR_IMAGES_BUCKET = "car-images";
export const FALLBACK_IMAGE = "/placeholders/car-1.svg";

/**
 * Turns a stored image path into a URL for next/image.
 * Seed data uses local `/…` paths; Supabase rows store a path inside the bucket.
 */
export function imageUrl(storagePath: string) {
  if (storagePath.startsWith("/") || /^https?:\/\//.test(storagePath)) return storagePath;
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${CAR_IMAGES_BUCKET}/${storagePath}`;
}

export function coverImage(car: Pick<Car, "images">): CarImage | undefined {
  return car.images[0];
}

export function coverImageUrl(car: Pick<Car, "images">) {
  const cover = coverImage(car);
  return cover ? imageUrl(cover.storagePath) : FALLBACK_IMAGE;
}
