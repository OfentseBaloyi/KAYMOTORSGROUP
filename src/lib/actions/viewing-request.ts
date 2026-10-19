"use server";

import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public-client";
import {
  HONEYPOT_FIELD,
  fieldErrors,
  viewingFormToInput,
  viewingRequestSchema,
  type ViewingFieldErrors,
} from "@/lib/validation/viewing-request";

export type ViewingRequestState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: ViewingFieldErrors }
  | {
      status: "success";
      /** False when running on seed data (nothing was saved). */
      stored: boolean;
    };

export async function submitViewingRequest(
  _prev: ViewingRequestState,
  formData: FormData,
): Promise<ViewingRequestState> {
  // Bots fill every field. Pretend it worked so they don't retry.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", stored: false };
  }

  // Never trust the browser: validate again on the server.
  const parsed = viewingRequestSchema.safeParse(viewingFormToInput(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error),
    };
  }
  const data = parsed.data;

  if (!isSupabaseConfigured()) {
    console.info("[viewing] Supabase not configured; request not saved:", {
      car: data.carId,
      date: data.preferredDate,
    });
    return { status: "success", stored: false };
  }

  const supabase = createPublicClient();

  const { data: car, error: carError } = await supabase
    .from("cars")
    .select("id, status")
    .eq("id", data.carId)
    .maybeSingle();
  if (carError || !car) {
    return { status: "error", message: "We couldn't find that car. Please refresh the page and try again." };
  }
  if (car.status === "sold") {
    return { status: "error", message: "Sorry, this car has just been sold." };
  }

  // Insert only (no .select()): visitors aren't allowed to read requests back.
  const { error } = await supabase.from("viewing_requests").insert({
    car_id: data.carId,
    name: data.name,
    phone: data.phone,
    preferred_date: data.preferredDate,
    preferred_time: data.preferredTime,
    payment_readiness: data.paymentReadiness,
    message: data.message ?? null,
  });

  if (error) {
    console.error("[viewing] insert failed:", error.code, error.message);
    return {
      status: "error",
      message: "Something went wrong sending your request. Please try again, or send it on WhatsApp.",
    };
  }

  return { status: "success", stored: true };
}
