import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";
import { seedSource } from "@/lib/data/seed-source";
import type { CarSource } from "@/lib/data/source";
import { createPublicClient } from "@/lib/supabase/public-client";
import { CAR_SELECT, toCar, type CarRow } from "@/lib/supabase/rows";

// PostgREST code for "table not found". Happens when the env vars are set
// but the migration hasn't been run yet.
const TABLE_MISSING = "PGRST205";

let warnedMissingTables = false;

/** Throws on real errors. Returns normally (so the caller can fall back to seed data) only if the tables don't exist yet. */
function throwUnlessTablesMissing(error: PostgrestError) {
  if (error.code !== TABLE_MISSING) {
    throw new Error(`Supabase query failed: ${error.message} (${error.code})`);
  }
  if (!warnedMissingTables) {
    console.warn(
      "[data] Supabase tables not found. Run supabase/migrations in the SQL editor. Using seed data for now.",
    );
    warnedMissingTables = true;
  }
}

/** Escapes % and _ so user input in ilike() is matched literally. */
function likeLiteral(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export const supabaseSource: CarSource = {
  async listCars(f) {
    const supabase = createPublicClient();
    let query = supabase.from("cars").select(CAR_SELECT);

    if (!f.includeSold) query = query.neq("status", "sold");
    // ilike without wildcards = case-insensitive exact match.
    if (f.make) query = query.ilike("make", likeLiteral(f.make));
    if (f.model) query = query.ilike("model", likeLiteral(f.model));
    if (f.minPrice !== undefined) query = query.gte("price", f.minPrice);
    if (f.maxPrice !== undefined) query = query.lte("price", f.maxPrice);
    if (f.minYear !== undefined) query = query.gte("year", f.minYear);
    if (f.maxYear !== undefined) query = query.lte("year", f.maxYear);
    if (f.maxMileage !== undefined) query = query.lte("mileage_km", f.maxMileage);
    if (f.transmission) query = query.eq("transmission", f.transmission);
    if (f.fuelType) query = query.eq("fuel_type", f.fuelType);
    if (f.bodyType) query = query.eq("body_type", f.bodyType);

    switch (f.sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "mileage_asc":
        query = query.order("mileage_km", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      throwUnlessTablesMissing(error);
      return seedSource.listCars(f);
    }
    return (data as CarRow[]).map(toCar);
  },

  async getCarBySlug(slug) {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("cars")
      .select(CAR_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      throwUnlessTablesMissing(error);
      return seedSource.getCarBySlug(slug);
    }
    return data ? toCar(data as CarRow) : null;
  },

  async listAllCars() {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("cars")
      .select(CAR_SELECT)
      .order("created_at", { ascending: false });
    if (error) {
      throwUnlessTablesMissing(error);
      return seedSource.listAllCars();
    }
    return (data as CarRow[]).map(toCar);
  },
};
