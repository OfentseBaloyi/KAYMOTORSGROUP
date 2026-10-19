import { z } from "zod";
import { PAYMENT_READINESS, TIME_SLOTS } from "@/lib/types";

/** Today's date in South Africa as YYYY-MM-DD. */
export function saToday(now = new Date()) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(now);
}

function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export const MAX_DAYS_AHEAD = 60;

/** Name of the hidden honeypot input. Real visitors never see or fill it. */
export const HONEYPOT_FIELD = "website";

/**
 * Accepts the ways people type SA numbers ("068 330 1795", "0683301795",
 * "+27 68 330 1795", "27683301795") and returns +27XXXXXXXXX, or null.
 */
export function normaliseSaPhone(input: string) {
  const digits = input.replace(/[\s\-().]/g, "");
  const match = /^(?:\+?27|0)([1-8]\d{8})$/.exec(digits);
  return match ? `+27${match[1]}` : null;
}

export const viewingRequestSchema = z.object({
  carId: z.string().min(1).max(64),
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "That name is a bit long."),
  phone: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const normalised = normaliseSaPhone(v);
      if (!normalised) {
        ctx.addIssue({ code: "custom", message: "Enter a valid SA number, e.g. 082 123 4567." });
        return z.NEVER;
      }
      return normalised;
    }),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.")
    .refine((d) => d >= saToday(), "Choose today or a later date.")
    .refine((d) => d <= addDays(saToday(), MAX_DAYS_AHEAD), `Choose a date within ${MAX_DAYS_AHEAD} days.`),
  preferredTime: z.enum(TIME_SLOTS, { error: "Choose a time of day." }),
  paymentReadiness: z.enum(PAYMENT_READINESS, { error: "Let us know how you'll pay." }),
  message: z
    .string()
    .trim()
    .max(1000, "Please keep the message under 1000 characters.")
    .transform((v) => v || null)
    .optional(),
  agree: z.literal(true, { error: "Please tick the box to continue." }),
});

export type ViewingRequestInput = z.input<typeof viewingRequestSchema>;
export type ViewingRequestData = z.output<typeof viewingRequestSchema>;
export type ViewingFieldErrors = Partial<Record<keyof ViewingRequestInput, string>>;

/** Reads the form into the schema's input shape. */
export function viewingFormToInput(form: FormData) {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    carId: get("carId"),
    name: get("name"),
    phone: get("phone"),
    preferredDate: get("preferredDate"),
    preferredTime: get("preferredTime"),
    paymentReadiness: get("paymentReadiness"),
    message: get("message"),
    agree: form.get("agree") === "on",
  };
}

/** First error message per field, for showing under each input. */
export function fieldErrors(error: z.ZodError): ViewingFieldErrors {
  const out: ViewingFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ViewingRequestInput;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
