"use client";

import { Plus, X } from "lucide-react";
import { cloneElement, startTransition, useActionState, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { commonFeatures } from "@/config/features";
import { saveCar, type SaveCarState } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import { bodyTypeLabel, fuelLabel, statusLabel, transmissionLabel } from "@/lib/format";
import { BODY_TYPES, CAR_STATUSES, FUEL_TYPES, TRANSMISSIONS, type Car } from "@/lib/types";
import { carFieldErrors, carFormSchema, carFormToInput, type CarFieldErrors } from "@/lib/validation/car";

const COMMON_MAKES = [
  "Audi", "BMW", "Chery", "Chevrolet", "Ford", "GWM", "Haval", "Honda", "Hyundai", "Isuzu",
  "Jeep", "Kia", "Land Rover", "Mahindra", "Mazda", "Mercedes-Benz", "Mini", "Mitsubishi",
  "Nissan", "Opel", "Peugeot", "Renault", "Suzuki", "Toyota", "Volkswagen", "Volvo",
];

const initialState: SaveCarState = { status: "idle" };

export function CarForm({ car }: { car?: Car }) {
  const [state, formAction, pending] = useActionState(saveCar, initialState);
  const [clientErrors, setClientErrors] = useState<CarFieldErrors>({});
  const [features, setFeatures] = useState<string[]>(car?.features ?? []);
  const [customFeature, setCustomFeature] = useState("");

  const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errors = { ...serverErrors, ...clientErrors };
  const customFeatures = features.filter((f) => !(commonFeatures as readonly string[]).includes(f));

  const toggleFeature = (f: string, on: boolean) =>
    setFeatures((prev) => (on ? [...prev, f] : prev.filter((x) => x !== f)));

  const addCustomFeature = () => {
    const f = customFeature.trim();
    if (f && !features.some((x) => x.toLowerCase() === f.toLowerCase())) setFeatures((prev) => [...prev, f]);
    setCustomFeature("");
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Manual submit keeps the fields filled if the server returns an error.
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const parsed = carFormSchema.safeParse(carFormToInput(formData));
        if (!parsed.success) {
          const errs = carFieldErrors(parsed.error);
          setClientErrors(errs);
          e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
          return;
        }
        setClientErrors({});
        startTransition(() => formAction(formData));
      }}
      className="space-y-8 pb-24 md:pb-0"
    >
      {car && <input type="hidden" name="id" value={car.id} />}

      <Section title="The car">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Make" name="make" error={errors.make}>
            <input name="make" list="common-makes" defaultValue={car?.make} autoComplete="off" className={inputClass} />
          </Field>
          <datalist id="common-makes">
            {COMMON_MAKES.map((m) => <option key={m} value={m} />)}
          </datalist>
          <Field label="Model" name="model" error={errors.model}>
            <input name="model" defaultValue={car?.model} placeholder="Polo" className={inputClass} />
          </Field>
          <Field label="Variant" name="variant" hint="Optional, e.g. 1.0 TSI Highline" error={errors.variant}>
            <input name="variant" defaultValue={car?.variant ?? ""} className={inputClass} />
          </Field>
          <Field label="Year" name="year" error={errors.year}>
            <input name="year" inputMode="numeric" defaultValue={car?.year} placeholder="2019" className={inputClass} />
          </Field>
          <Field label="Price (R)" name="price" error={errors.price}>
            <input name="price" inputMode="numeric" defaultValue={car?.price} placeholder="189900" className={inputClass} />
          </Field>
          <Field label="Mileage (km)" name="mileageKm" error={errors.mileageKm}>
            <input name="mileageKm" inputMode="numeric" defaultValue={car?.mileageKm} placeholder="142000" className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Specs">
        <div className="space-y-4">
          <Segmented
            legend="Transmission"
            name="transmission"
            defaultValue={car?.transmission}
            options={TRANSMISSIONS.map((v) => ({ value: v, label: transmissionLabel[v] }))}
            error={errors.transmission}
          />
          <Segmented
            legend="Fuel"
            name="fuelType"
            defaultValue={car?.fuelType}
            options={FUEL_TYPES.map((v) => ({ value: v, label: fuelLabel[v] }))}
            error={errors.fuelType}
          />
          <Segmented
            legend="Body type"
            name="bodyType"
            defaultValue={car?.bodyType}
            options={BODY_TYPES.map((v) => ({ value: v, label: bodyTypeLabel[v] }))}
            error={errors.bodyType}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Colour" name="colour" error={errors.colour}>
              <input name="colour" defaultValue={car?.colour ?? ""} className={inputClass} />
            </Field>
            <Field label="Engine" name="engine" hint="e.g. 1.0L turbo petrol (85kW)" error={errors.engine}>
              <input name="engine" defaultValue={car?.engine ?? ""} className={inputClass} />
            </Field>
            <Field label="Owners" name="owners" hint="Leave blank if unknown" error={errors.owners}>
              <input name="owners" inputMode="numeric" defaultValue={car?.owners ?? ""} className={inputClass} />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Condition">
        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle name="serviceHistory" label="Service history" defaultChecked={car?.serviceHistory} />
          <Toggle name="accidentFree" label="Accident free" defaultChecked={car?.accidentFree} />
          <Toggle name="spareKeys" label="Spare keys" defaultChecked={car?.spareKeys} />
          <Toggle name="papersInOrder" label="Papers in order" defaultChecked={car?.papersInOrder} />
        </div>
      </Section>

      <Section title="Features">
        <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...commonFeatures, ...customFeatures].map((f) => (
            <label key={f} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="features"
                value={f}
                checked={features.includes(f)}
                onChange={(e) => toggleFeature(f, e.target.checked)}
                className="size-5 shrink-0 accent-navy-950"
              />
              <span>{f}</span>
              {customFeatures.includes(f) && (
                <button
                  type="button"
                  onClick={() => toggleFeature(f, false)}
                  className="ml-auto inline-flex size-9 items-center justify-center text-muted hover:text-status-sold"
                  aria-label={`Remove ${f}`}
                >
                  <X size={16} />
                </button>
              )}
            </label>
          ))}
        </div>
        <div className="mt-3 flex max-w-md gap-2">
          <label htmlFor="custom-feature" className="sr-only">Add a custom feature</label>
          <input
            id="custom-feature"
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomFeature();
              }
            }}
            maxLength={60}
            placeholder="Add a feature, e.g. Towbar"
            className={inputClass}
          />
          <button type="button" onClick={addCustomFeature} className={buttonClasses("outline", "md", "mt-1")}>
            <Plus size={18} aria-hidden="true" /> Add
          </button>
        </div>
        {errors.features && <p className="mt-1 text-sm font-semibold text-status-sold">{errors.features}</p>}
      </Section>

      <Section title="Description">
        <Field label="About this car" name="description" hint="Shown on the car page" error={errors.description}>
          <textarea name="description" rows={5} defaultValue={car?.description ?? ""} maxLength={5000} className={cn(inputClass, "py-2")} />
        </Field>
      </Section>

      <Section title="Listing">
        <div className="space-y-4">
          <Segmented
            legend="Status"
            name="status"
            defaultValue={car?.status ?? "available"}
            options={CAR_STATUSES.map((v) => ({ value: v, label: statusLabel[v] }))}
            error={errors.status}
          />
          <Toggle name="isFeatured" label="Featured on homepage" defaultChecked={car?.isFeatured} />
        </div>
      </Section>

      {state.status === "error" && (
        <p role="alert" className="rounded-card border border-status-sold/30 bg-white p-3 text-status-sold">
          {state.message}
        </p>
      )}

      {/* Sticky on phones so Save is always reachable. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 p-3 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0">
        <button type="submit" disabled={pending} className={buttonClasses("dark", "lg", "w-full md:w-auto")}>
          {pending ? "Saving…" : car ? "Save changes" : "Save and add photos"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "mt-1 block min-h-11 w-full rounded-card border border-line bg-white px-3 text-base aria-[invalid=true]:border-status-sold";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-card border border-line bg-white p-4 md:p-5">
      <legend className="px-1 font-display text-xl font-bold uppercase tracking-wide">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: React.ReactElement<React.AriaAttributes>;
}) {
  // The label wraps the control, so no id is needed to link them.
  const errorId = `car-${name}-error`;
  return (
    <div>
      <label className="block">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
        {cloneElement(children, {
          "aria-invalid": Boolean(error) || undefined,
          "aria-describedby": error ? errorId : undefined,
        })}
      </label>
      {error && (
        <p id={errorId} className="mt-1 text-sm font-semibold text-status-sold">
          {error}
        </p>
      )}
    </div>
  );
}

function Segmented({
  legend,
  name,
  options,
  defaultValue,
  error,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-11 cursor-pointer items-center rounded-card border bg-white px-3 text-sm font-semibold",
              "has-checked:border-navy-950 has-checked:bg-navy-950 has-checked:text-white",
              "has-focus-visible:outline-3 has-focus-visible:outline-orange-500",
              error ? "border-status-sold" : "border-line",
            )}
          >
            <input type="radio" name={name} value={o.value} defaultChecked={defaultValue === o.value} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm font-semibold text-status-sold">{error}</p>}
    </fieldset>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-line px-3 has-checked:border-navy-950">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 accent-navy-950" />
      <span className="font-semibold">{label}</span>
    </label>
  );
}
