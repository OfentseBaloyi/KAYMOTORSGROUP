"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/require-admin";
import { CARS_TAG } from "@/lib/data/cars";
import { carSlug } from "@/lib/format";
import { CAR_IMAGES_BUCKET, imageUrl } from "@/lib/images";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { CAR_STATUSES, VIEWING_STATUSES, type CarStatus, type ViewingStatus } from "@/lib/types";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  carFieldErrors,
  carFormSchema,
  carFormToInput,
  type CarFieldErrors,
  type CarFormData,
} from "@/lib/validation/car";

// Every action starts with requireAdmin(). See src/lib/admin/require-admin.ts.

const uuid = z.uuid();

export type SaveCarState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: CarFieldErrors };

function toRow(d: CarFormData) {
  return {
    make: d.make,
    model: d.model,
    variant: d.variant,
    year: d.year,
    price: d.price,
    mileage_km: d.mileageKm,
    transmission: d.transmission,
    fuel_type: d.fuelType,
    body_type: d.bodyType,
    colour: d.colour,
    engine: d.engine,
    owners: d.owners,
    service_history: d.serviceHistory,
    accident_free: d.accidentFree,
    spare_keys: d.spareKeys,
    papers_in_order: d.papersInOrder,
    features: d.features,
    description: d.description,
    status: d.status,
    is_featured: d.isFeatured,
  };
}

/** Creates a car (new stock number + slug) or updates one. */
export async function saveCar(_prev: SaveCarState, formData: FormData): Promise<SaveCarState> {
  await requireAdmin();

  const parsed = carFormSchema.safeParse(carFormToInput(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: carFieldErrors(parsed.error),
    };
  }
  const data = parsed.data;
  const idField = formData.get("id");
  const supabase = createAdminClient();
  let carId: string;

  if (typeof idField === "string" && idField) {
    // Update. The slug follows the title; old links still work because the
    // car page redirects using the stock number at the end of the slug.
    const id = uuid.safeParse(idField);
    if (!id.success) return { status: "error", message: "Invalid car id." };
    const { data: existing, error: getError } = await supabase
      .from("cars")
      .select("stock_number")
      .eq("id", id.data)
      .single();
    if (getError || !existing) return { status: "error", message: "That car no longer exists." };

    const { error } = await supabase
      .from("cars")
      .update({ ...toRow(data), slug: carSlug({ ...data, stockNumber: existing.stock_number }) })
      .eq("id", id.data);
    if (error) return { status: "error", message: `Could not save: ${error.message}` };
    carId = id.data;
  } else {
    const { data: stockNumber, error: stockError } = await supabase.rpc("next_stock_number");
    if (stockError || typeof stockNumber !== "string") {
      return { status: "error", message: `Could not get a stock number: ${stockError?.message ?? "unknown error"}` };
    }
    const { data: created, error } = await supabase
      .from("cars")
      .insert({ ...toRow(data), stock_number: stockNumber, slug: carSlug({ ...data, stockNumber }) })
      .select("id")
      .single();
    if (error || !created) return { status: "error", message: `Could not save: ${error?.message}` };
    carId = created.id;
  }

  updateTag(CARS_TAG);
  // redirect() throws, so it must be outside any try/catch.
  redirect(`/admin/cars/${carId}?saved=1`);
}

export async function setCarStatus(id: string, status: CarStatus) {
  await requireAdmin();
  const parsedId = uuid.safeParse(id);
  if (!parsedId.success || !CAR_STATUSES.includes(status)) return { ok: false as const, error: "Invalid input." };

  const { error } = await createAdminClient().from("cars").update({ status }).eq("id", parsedId.data);
  if (error) return { ok: false as const, error: error.message };
  updateTag(CARS_TAG);
  return { ok: true as const };
}

export async function deleteCar(id: string) {
  await requireAdmin();
  const parsedId = uuid.safeParse(id);
  if (!parsedId.success) return { ok: false as const, error: "Invalid car id." };
  const supabase = createAdminClient();

  // Remove the photos from storage first; the rows go with the car (cascade).
  const { data: files } = await supabase.storage.from(CAR_IMAGES_BUCKET).list(parsedId.data, { limit: 1000 });
  if (files?.length) {
    await supabase.storage.from(CAR_IMAGES_BUCKET).remove(files.map((f) => `${parsedId.data}/${f.name}`));
  }
  const { error } = await supabase.from("cars").delete().eq("id", parsedId.data);
  if (error) return { ok: false as const, error: error.message };
  updateTag(CARS_TAG);
  return { ok: true as const };
}

export interface UploadedImage {
  id: string;
  url: string;
  storagePath: string;
}

/** Uploads one (already compressed) photo. Called once per photo by the client. */
export async function uploadCarImage(carId: string, formData: FormData) {
  await requireAdmin();
  const parsedId = uuid.safeParse(carId);
  const file = formData.get("file");
  if (!parsedId.success) return { ok: false as const, error: "Invalid car id." };
  if (!(file instanceof File)) return { ok: false as const, error: "No file received." };
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false as const, error: "Only JPEG, PNG or WebP photos." };
  }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false as const, error: "Photo is too large after compression." };

  const supabase = createAdminClient();
  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  const storagePath = `${parsedId.data}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(storagePath, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (uploadError) return { ok: false as const, error: uploadError.message };

  // New photos go to the end. The first photo is the cover.
  const { data: last } = await supabase
    .from("car_images")
    .select("sort_order")
    .eq("car_id", parsedId.data)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const altText = formData.get("alt");
  const { data: row, error } = await supabase
    .from("car_images")
    .insert({
      car_id: parsedId.data,
      storage_path: storagePath,
      sort_order: (last?.sort_order ?? -1) + 1,
      alt: typeof altText === "string" ? altText.slice(0, 200) : null,
    })
    .select("id")
    .single();
  if (error || !row) {
    await supabase.storage.from(CAR_IMAGES_BUCKET).remove([storagePath]);
    return { ok: false as const, error: error?.message ?? "Could not save photo." };
  }

  updateTag(CARS_TAG);
  return { ok: true as const, image: { id: row.id, storagePath, url: imageUrl(storagePath) } satisfies UploadedImage };
}

/** Saves a new photo order. The first id becomes the cover. */
export async function reorderCarImages(carId: string, orderedIds: string[]) {
  await requireAdmin();
  const ids = z.array(uuid).max(100).safeParse(orderedIds);
  const parsedCar = uuid.safeParse(carId);
  if (!ids.success || !parsedCar.success) return { ok: false as const, error: "Invalid input." };

  const supabase = createAdminClient();
  const results = await Promise.all(
    ids.data.map((id, index) =>
      supabase.from("car_images").update({ sort_order: index }).eq("id", id).eq("car_id", parsedCar.data),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false as const, error: failed.error.message };
  updateTag(CARS_TAG);
  return { ok: true as const };
}

export async function deleteCarImage(imageId: string) {
  await requireAdmin();
  const parsedId = uuid.safeParse(imageId);
  if (!parsedId.success) return { ok: false as const, error: "Invalid image id." };

  const supabase = createAdminClient();
  const { data: image, error: getError } = await supabase
    .from("car_images")
    .select("storage_path")
    .eq("id", parsedId.data)
    .single();
  if (getError || !image) return { ok: false as const, error: "Photo not found." };

  const { error } = await supabase.from("car_images").delete().eq("id", parsedId.data);
  if (error) return { ok: false as const, error: error.message };
  await supabase.storage.from(CAR_IMAGES_BUCKET).remove([image.storage_path]);
  updateTag(CARS_TAG);
  return { ok: true as const };
}

export async function setViewingStatus(id: string, status: ViewingStatus) {
  await requireAdmin();
  const parsedId = uuid.safeParse(id);
  if (!parsedId.success || !VIEWING_STATUSES.includes(status)) return { ok: false as const, error: "Invalid input." };
  const { error } = await createAdminClient().from("viewing_requests").update({ status }).eq("id", parsedId.data);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
