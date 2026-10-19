"use client";

import { FILTER_FORM_ID, useApplyFilters } from "@/components/cars/inventory-filters";
import type { SortOption } from "@/lib/types";

const labels: Record<SortOption, string> = {
  newest: "Newest listings",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  mileage_asc: "Lowest mileage",
};

/** Lives outside the filter form visually but submits with it (form attribute). */
export function SortSelect({ value }: { value?: SortOption }) {
  const { apply } = useApplyFilters();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-semibold">Sort</span>
      <select
        key={value ?? "newest"}
        name="sort"
        form={FILTER_FORM_ID}
        defaultValue={value ?? "newest"}
        onChange={apply}
        className="min-h-11 rounded-card border border-line bg-white px-3 text-base"
      >
        {Object.entries(labels).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </label>
  );
}
