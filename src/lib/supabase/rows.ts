import type { Car, CarImage, ViewingRequest } from "@/lib/types";

// Row shapes as Postgres returns them (snake_case), plus mappers to the
// app's camelCase types. Keep in sync with supabase/migrations.

export interface CarImageRow {
  id: string;
  car_id: string;
  storage_path: string;
  sort_order: number;
  alt: string | null;
  created_at: string;
}

export interface CarRow {
  id: string;
  slug: string;
  stock_number: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  price: number;
  mileage_km: number;
  transmission: Car["transmission"];
  fuel_type: Car["fuelType"];
  body_type: Car["bodyType"];
  colour: string | null;
  engine: string | null;
  owners: number | null;
  service_history: boolean;
  accident_free: boolean;
  spare_keys: boolean;
  papers_in_order: boolean;
  features: string[];
  description: string | null;
  status: Car["status"];
  is_featured: boolean;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
  car_images?: CarImageRow[];
}

export interface ViewingRequestRow {
  id: string;
  car_id: string | null;
  name: string;
  phone: string;
  preferred_date: string;
  preferred_time: ViewingRequest["preferredTime"];
  payment_readiness: ViewingRequest["paymentReadiness"];
  message: string | null;
  status: ViewingRequest["status"];
  created_at: string;
}

/** Select string for a car with its images. */
export const CAR_SELECT = "*, car_images(*)";

export function toCarImage(row: CarImageRow): CarImage {
  return {
    id: row.id,
    carId: row.car_id,
    storagePath: row.storage_path,
    sortOrder: row.sort_order,
    alt: row.alt,
  };
}

export function toCar(row: CarRow): Car {
  return {
    id: row.id,
    slug: row.slug,
    stockNumber: row.stock_number,
    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    price: row.price,
    mileageKm: row.mileage_km,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    bodyType: row.body_type,
    colour: row.colour,
    engine: row.engine,
    owners: row.owners,
    serviceHistory: row.service_history,
    accidentFree: row.accident_free,
    spareKeys: row.spare_keys,
    papersInOrder: row.papers_in_order,
    features: row.features ?? [],
    description: row.description,
    status: row.status,
    isFeatured: row.is_featured,
    soldAt: row.sold_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: (row.car_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(toCarImage),
  };
}

export function toViewingRequest(row: ViewingRequestRow): ViewingRequest {
  return {
    id: row.id,
    carId: row.car_id,
    name: row.name,
    phone: row.phone,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    paymentReadiness: row.payment_readiness,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}
