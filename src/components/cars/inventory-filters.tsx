"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { FilterOptions } from "@/lib/data/cars";
import { bodyTypeLabel, formatMileage, formatPrice, fuelLabel, transmissionLabel } from "@/lib/format";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, type CarFilters } from "@/lib/types";

export const FILTER_FORM_ID = "inventory-filters";

const PRICE_STEPS = [50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 750000];
const MILEAGE_STEPS = [30000, 60000, 100000, 150000, 200000];

interface InventoryFiltersProps {
  filters: CarFilters;
  options: FilterOptions;
  resultCount: number;
}

/** Turns the form's current values into a /cars?… URL, skipping empty fields. */
function formToUrl(form: HTMLFormElement) {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (typeof value === "string" && value !== "") params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/cars?${qs}` : "/cars";
}

export function useApplyFilters() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const apply = () => {
    const form = document.getElementById(FILTER_FORM_ID) as HTMLFormElement | null;
    if (!form) return;
    startTransition(() => router.replace(formToUrl(form), { scroll: false }));
  };
  return { apply, pending };
}

export function countActiveFilters(f: CarFilters) {
  const keys: (keyof CarFilters)[] = [
    "make", "model", "minPrice", "maxPrice", "minYear", "maxYear",
    "maxMileage", "transmission", "fuelType", "bodyType", "includeSold",
  ];
  return keys.filter((k) => f[k] !== undefined).length;
}

export function InventoryFilters({ filters, options, resultCount }: InventoryFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { apply, pending } = useApplyFilters();
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (!sheetOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={buttonClasses("outline", "md", "lg:hidden")}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        Filters{activeCount > 0 && ` (${activeCount})`}
      </button>

      {sheetOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/50 lg:hidden"
          onClick={() => setSheetOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        role={sheetOpen ? "dialog" : undefined}
        aria-modal={sheetOpen ? true : undefined}
        aria-labelledby="filters-title"
        className={cn(
          // Mobile: bottom sheet. Desktop: static sidebar.
          "fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] flex-col rounded-t-xl bg-white shadow-lg",
          sheetOpen ? "flex" : "hidden",
          "lg:static lg:z-auto lg:flex lg:max-h-none lg:rounded-none lg:bg-transparent lg:shadow-none",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2 lg:border-0 lg:px-0 lg:pt-0">
          <h2 id="filters-title" className="font-display text-xl font-bold uppercase tracking-wide">
            Filter
          </h2>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Link href="/cars" scroll={false} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-orange-700 hover:underline">
                Clear all
              </Link>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={() => setSheetOpen(false)}
              className="inline-flex size-11 items-center justify-center rounded-card hover:bg-sand lg:hidden"
              aria-label="Close filters"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* The key changes with the URL, which resets the fields after
            "Clear all" or browser back/forward. */}
        <FilterForm
          key={JSON.stringify(filters)}
          filters={filters}
          options={options}
          onApply={apply}
          onSubmitted={() => setSheetOpen(false)}
        />

        <div className="border-t border-line p-4 lg:hidden">
          <button
            type="submit"
            form={FILTER_FORM_ID}
            className={buttonClasses("dark", "lg", "w-full")}
          >
            {pending ? "Updating…" : `Show ${resultCount} ${resultCount === 1 ? "car" : "cars"}`}
          </button>
        </div>
      </div>
    </>
  );
}

interface FilterFormProps {
  filters: CarFilters;
  options: FilterOptions;
  onApply: () => void;
  onSubmitted: () => void;
}

function FilterForm({ filters, options, onApply, onSubmitted }: FilterFormProps) {
  const [make, setMake] = useState(filters.make ?? "");
  const models = make ? (options.modelsByMake[make] ?? []) : [];

  return (
    <form
      id={FILTER_FORM_ID}
      action="/cars"
      method="get"
      onChange={onApply}
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
        onSubmitted();
      }}
      className="flex-1 space-y-4 overflow-y-auto px-4 py-4 lg:overflow-visible lg:px-0"
    >
      <Field label="Make" htmlFor="f-make">
        <select
          id="f-make"
          name="make"
          value={make}
          onChange={(e) => {
            // Clear the model before the form's onChange reads the values,
            // otherwise "Ford + Fortuner" would be submitted.
            const model = e.currentTarget.form?.elements.namedItem("model");
            if (model instanceof HTMLSelectElement) model.value = "";
            setMake(e.target.value);
          }}
          className={selectClass}
        >
          <option value="">Any make</option>
          {options.makes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </Field>

      <Field label="Model" htmlFor="f-model">
        {/* Remounts when the make changes so the model resets to "Any". */}
        <select
          key={make}
          id="f-model"
          name="model"
          defaultValue={make === filters.make ? (filters.model ?? "") : ""}
          disabled={!make}
          className={selectClass}
        >
          <option value="">{make ? "Any model" : "Choose a make first"}</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className={labelClass}>Price</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <select name="minPrice" aria-label="Minimum price" defaultValue={filters.minPrice ?? ""} className={selectClass}>
            <option value="">No min</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>{formatPrice(p)}</option>
            ))}
          </select>
          <select name="maxPrice" aria-label="Maximum price" defaultValue={filters.maxPrice ?? ""} className={selectClass}>
            <option value="">No max</option>
            {PRICE_STEPS.map((p) => (
              <option key={p} value={p}>{formatPrice(p)}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Year</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <select name="minYear" aria-label="Oldest year" defaultValue={filters.minYear ?? ""} className={selectClass}>
            <option value="">From any</option>
            {[...options.years].reverse().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select name="maxYear" aria-label="Newest year" defaultValue={filters.maxYear ?? ""} className={selectClass}>
            <option value="">To any</option>
            {options.years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <Field label="Max mileage" htmlFor="f-mileage">
        <select id="f-mileage" name="maxMileage" defaultValue={filters.maxMileage ?? ""} className={selectClass}>
          <option value="">Any mileage</option>
          {MILEAGE_STEPS.map((km) => (
            <option key={km} value={km}>Up to {formatMileage(km)}</option>
          ))}
        </select>
      </Field>

      <Field label="Transmission" htmlFor="f-transmission">
        <select id="f-transmission" name="transmission" defaultValue={filters.transmission ?? ""} className={selectClass}>
          <option value="">Any</option>
          {TRANSMISSIONS.map((t) => (
            <option key={t} value={t}>{transmissionLabel[t]}</option>
          ))}
        </select>
      </Field>

      <Field label="Fuel" htmlFor="f-fuel">
        <select id="f-fuel" name="fuelType" defaultValue={filters.fuelType ?? ""} className={selectClass}>
          <option value="">Any</option>
          {FUEL_TYPES.map((f) => (
            <option key={f} value={f}>{fuelLabel[f]}</option>
          ))}
        </select>
      </Field>

      <Field label="Body type" htmlFor="f-body">
        <select id="f-body" name="bodyType" defaultValue={filters.bodyType ?? ""} className={selectClass}>
          <option value="">Any</option>
          {BODY_TYPES.map((b) => (
            <option key={b} value={b}>{bodyTypeLabel[b]}</option>
          ))}
        </select>
      </Field>

      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="includeSold"
          value="1"
          defaultChecked={filters.includeSold ?? false}
          className="size-5 accent-navy-950"
        />
        <span>Include sold cars</span>
      </label>
    </form>
  );
}

const labelClass = "block text-sm font-semibold text-navy-950";
const selectClass =
  "block min-h-11 w-full rounded-card border border-line bg-white px-3 text-base text-ink disabled:bg-sand disabled:text-muted";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
