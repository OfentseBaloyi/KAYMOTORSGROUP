import { Check, FileCheck, KeyRound, ShieldCheck, Wrench } from "lucide-react";
import {
  bodyTypeLabel,
  formatMileage,
  fuelLabel,
  transmissionLabel,
} from "@/lib/format";
import type { Car } from "@/lib/types";

export function SpecGrid({ car }: { car: Car }) {
  const specs: Array<[string, string | number | null]> = [
    ["Year", car.year],
    ["Mileage", formatMileage(car.mileageKm)],
    ["Transmission", transmissionLabel[car.transmission]],
    ["Fuel", fuelLabel[car.fuelType]],
    ["Body type", bodyTypeLabel[car.bodyType]],
    ["Colour", car.colour],
    ["Engine", car.engine],
    ["Owners", car.owners],
  ];

  return (
    <dl className="grid grid-cols-2 border-t border-l border-line sm:grid-cols-4">
      {specs.map(([label, value]) => (
        <div key={label} className="border-r border-b border-line bg-white px-3 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
          <dd className="mt-0.5 font-semibold text-navy-950">{value ?? "–"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TrustBadges({ car }: { car: Car }) {
  const badges = [
    car.serviceHistory && { label: "Service history", Icon: Wrench },
    car.accidentFree && { label: "Accident free", Icon: ShieldCheck },
    car.spareKeys && { label: "Spare keys", Icon: KeyRound },
    car.papersInOrder && { label: "Papers in order", Icon: FileCheck },
  ].filter(Boolean) as Array<{ label: string; Icon: typeof Wrench }>;

  if (badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Vehicle checks">
      {badges.map(({ label, Icon }) => (
        <li
          key={label}
          className="inline-flex items-center gap-1.5 rounded-sm border border-navy-950/15 bg-white px-2.5 py-1 text-sm font-semibold text-navy-950"
        >
          <Icon size={16} className="text-status-available" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function FeatureList({ features }: { features: string[] }) {
  if (features.length === 0) return null;
  return (
    <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check size={18} className="mt-0.5 shrink-0 text-orange-700" aria-hidden="true" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
