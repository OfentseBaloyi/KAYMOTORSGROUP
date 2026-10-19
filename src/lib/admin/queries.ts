import "server-only";
import { createAdminClient } from "@/lib/supabase/admin-client";
import {
  CAR_SELECT,
  toCar,
  toViewingRequest,
  type CarRow,
  type ViewingRequestRow,
} from "@/lib/supabase/rows";
import type { Car, CarStatus, PaymentReadiness, ViewingRequest } from "@/lib/types";

// Admin reads use the service role and are never cached: the admin should
// always see the latest data.

function fail(context: string, error: { message: string; code?: string }): never {
  throw new Error(`[admin] ${context}: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}

export async function adminListCars(search?: string): Promise<Car[]> {
  const supabase = createAdminClient();
  let query = supabase.from("cars").select(CAR_SELECT).order("created_at", { ascending: false });
  const q = search?.trim();
  if (q) {
    // Strip characters that have meaning in PostgREST filter syntax.
    const safe = q.replace(/[,()%*\\]/g, " ").trim();
    if (safe) {
      query = query.or(
        ["make", "model", "variant", "stock_number", "colour"]
          .map((col) => `${col}.ilike.%${safe}%`)
          .join(","),
      );
    }
  }
  const { data, error } = await query;
  if (error) fail("list cars", error);
  return (data as CarRow[]).map(toCar);
}

export async function adminGetCar(id: string): Promise<Car | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("cars").select(CAR_SELECT).eq("id", id).maybeSingle();
  if (error) {
    // Invalid uuid syntax: treat as not found.
    if (error.code === "22P02") return null;
    fail("get car", error);
  }
  return data ? toCar(data as CarRow) : null;
}

/** First day of the current month in South Africa, as an ISO timestamp. */
function startOfMonthSA(now = new Date()) {
  const [y, m] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
  })
    .format(now)
    .split("-");
  return `${y}-${m}-01T00:00:00+02:00`;
}

export async function adminDashboardStats() {
  const supabase = createAdminClient();
  const count = async (build: () => PromiseLike<{ count: number | null; error: { message: string } | null }>) => {
    const { count, error } = await build();
    if (error) fail("dashboard count", error);
    return count ?? 0;
  };
  const head = { count: "exact" as const, head: true };

  const [available, reserved, soldThisMonth, newRequests] = await Promise.all([
    count(() => supabase.from("cars").select("id", head).eq("status", "available")),
    count(() => supabase.from("cars").select("id", head).eq("status", "reserved")),
    count(() =>
      supabase.from("cars").select("id", head).eq("status", "sold").gte("sold_at", startOfMonthSA()),
    ),
    count(() => supabase.from("viewing_requests").select("id", head).eq("status", "new")),
  ]);

  return { available, reserved, soldThisMonth, newRequests };
}

export interface AdminViewingRequest extends ViewingRequest {
  car: Pick<Car, "id" | "slug" | "stockNumber" | "year" | "make" | "model" | "variant" | "status"> | null;
}

const READINESS_RANK: Record<PaymentReadiness, number> = {
  cash_ready: 0,
  finance_preapproved: 1,
  arranging: 2,
};

type RequestRowWithCar = ViewingRequestRow & {
  cars: {
    id: string;
    slug: string;
    stock_number: string;
    year: number;
    make: string;
    model: string;
    variant: string | null;
    status: CarStatus;
  } | null;
};

/**
 * Most ready buyers first (Cash/EFT, then pre-approved finance, then still
 * arranging), then soonest preferred date.
 */
export async function adminListViewingRequests(limit?: number): Promise<AdminViewingRequest[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("viewing_requests")
    .select("*, cars(id, slug, stock_number, year, make, model, variant, status)")
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) fail("list viewing requests", error);

  return (data as RequestRowWithCar[]).map((row) => ({
    ...toViewingRequest(row),
    car: row.cars
      ? {
          id: row.cars.id,
          slug: row.cars.slug,
          stockNumber: row.cars.stock_number,
          year: row.cars.year,
          make: row.cars.make,
          model: row.cars.model,
          variant: row.cars.variant,
          status: row.cars.status,
        }
      : null,
  }));
}

export function sortByReadiness(requests: AdminViewingRequest[]) {
  return [...requests].sort(
    (a, b) =>
      READINESS_RANK[a.paymentReadiness] - READINESS_RANK[b.paymentReadiness] ||
      a.preferredDate.localeCompare(b.preferredDate) ||
      b.createdAt.localeCompare(a.createdAt),
  );
}
