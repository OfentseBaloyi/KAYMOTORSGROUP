import { z } from "zod";
import { BODY_TYPES, CAR_STATUSES, FUEL_TYPES, TRANSMISSIONS } from "@/lib/types";

const text = (max: number, label: string) =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} is too long.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null);

// Accepts "189 900", "R189,900", "189900".
const rands = (label: string) =>
  z
    .string()
    .transform((v) => v.replace(/[^\d]/g, ""))
    .pipe(z.string().min(1, `${label} is required.`))
    .transform(Number)
    .pipe(z.number().int().min(0).max(100_000_000, `${label} looks too high.`));

const thisYear = new Date().getFullYear();

export const carFormSchema = z.object({
  make: text(50, "Make"),
  model: text(50, "Model"),
  variant: optionalText(100),
  year: z
    .string()
    .trim()
    .min(1, "Year is required.")
    .transform(Number)
    .pipe(
      z
        .number({ error: "Year looks wrong." })
        .int("Year looks wrong.")
        .min(1950, "Year looks wrong.")
        .max(thisYear + 1, "Year looks wrong."),
    ),
  price: rands("Price"),
  mileageKm: rands("Mileage"),
  transmission: z.enum(TRANSMISSIONS, { error: "Choose a transmission." }),
  fuelType: z.enum(FUEL_TYPES, { error: "Choose a fuel type." }),
  bodyType: z.enum(BODY_TYPES, { error: "Choose a body type." }),
  colour: optionalText(50),
  engine: optionalText(100),
  owners: z
    .string()
    .transform((v) => (v.trim() === "" ? null : Number(v)))
    .pipe(z.number().int().min(0).max(20).nullable()),
  serviceHistory: z.boolean(),
  accidentFree: z.boolean(),
  spareKeys: z.boolean(),
  papersInOrder: z.boolean(),
  features: z.array(z.string().trim().min(1).max(60)).max(60),
  description: optionalText(5000),
  status: z.enum(CAR_STATUSES),
  isFeatured: z.boolean(),
});

export type CarFormInput = z.input<typeof carFormSchema>;
export type CarFormData = z.output<typeof carFormSchema>;
export type CarFieldErrors = Partial<Record<keyof CarFormInput, string>>;

export function carFormToInput(form: FormData): CarFormInput {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const features = form
    .getAll("features")
    .filter((v): v is string => typeof v === "string");
  return {
    make: get("make"),
    model: get("model"),
    variant: get("variant"),
    year: get("year"),
    price: get("price"),
    mileageKm: get("mileageKm"),
    transmission: get("transmission") as CarFormInput["transmission"],
    fuelType: get("fuelType") as CarFormInput["fuelType"],
    bodyType: get("bodyType") as CarFormInput["bodyType"],
    colour: get("colour"),
    engine: get("engine"),
    owners: get("owners"),
    serviceHistory: form.get("serviceHistory") === "on",
    accidentFree: form.get("accidentFree") === "on",
    spareKeys: form.get("spareKeys") === "on",
    papersInOrder: form.get("papersInOrder") === "on",
    features: [...new Set(features.map((f) => f.trim()).filter(Boolean))],
    description: get("description"),
    status: (get("status") || "available") as CarFormInput["status"],
    isFeatured: form.get("isFeatured") === "on",
  };
}

export function carFieldErrors(error: z.ZodError): CarFieldErrors {
  const out: CarFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof CarFormInput;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
