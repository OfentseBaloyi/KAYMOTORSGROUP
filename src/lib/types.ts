// Domain types. These mirror the Supabase tables (see supabase/migrations, Phase 3).

export const TRANSMISSIONS = ["manual", "automatic"] as const;
export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"] as const;
export const BODY_TYPES = ["hatchback", "sedan", "suv", "bakkie", "mpv", "coupe", "other"] as const;
export const CAR_STATUSES = ["available", "reserved", "sold"] as const;

export const TIME_SLOTS = ["morning", "afternoon", "evening"] as const;
export const PAYMENT_READINESS = ["cash_ready", "finance_preapproved", "arranging"] as const;
export const VIEWING_STATUSES = ["new", "confirmed", "completed", "no_show", "cancelled"] as const;

export type Transmission = (typeof TRANSMISSIONS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type CarStatus = (typeof CAR_STATUSES)[number];
export type TimeSlot = (typeof TIME_SLOTS)[number];
export type PaymentReadiness = (typeof PAYMENT_READINESS)[number];
export type ViewingStatus = (typeof VIEWING_STATUSES)[number];

export interface CarImage {
  id: string;
  carId: string;
  /** Path inside the `car-images` bucket, or a local `/…` path for seed data. */
  storagePath: string;
  sortOrder: number;
  alt: string | null;
}

export interface Car {
  id: string;
  slug: string;
  stockNumber: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  /** Whole rands. */
  price: number;
  mileageKm: number;
  transmission: Transmission;
  fuelType: FuelType;
  bodyType: BodyType;
  colour: string | null;
  engine: string | null;
  owners: number | null;
  serviceHistory: boolean;
  accidentFree: boolean;
  spareKeys: boolean;
  papersInOrder: boolean;
  features: string[];
  description: string | null;
  status: CarStatus;
  isFeatured: boolean;
  soldAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Sorted by sortOrder; the first one is the cover. */
  images: CarImage[];
}

export interface ViewingRequest {
  id: string;
  carId: string | null;
  name: string;
  phone: string;
  preferredDate: string;
  preferredTime: TimeSlot;
  paymentReadiness: PaymentReadiness;
  message: string | null;
  status: ViewingStatus;
  createdAt: string;
}

export const SORT_OPTIONS = ["newest", "price_asc", "price_desc", "mileage_asc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/** Inventory filters. Every field is optional; these map 1:1 to URL search params. */
export interface CarFilters {
  make?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  transmission?: Transmission;
  fuelType?: FuelType;
  bodyType?: BodyType;
  includeSold?: boolean;
  sort?: SortOption;
}
