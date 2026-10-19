"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setCarStatus } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";
import { statusLabel } from "@/lib/format";
import { CAR_STATUSES, type CarStatus } from "@/lib/types";

const tone: Record<CarStatus, string> = {
  available: "border-status-available text-status-available",
  reserved: "border-status-reserved text-status-reserved",
  sold: "border-status-sold text-status-sold",
};

/** Quick status change straight from the list. */
export function CarStatusSelect({ id, status, label }: { id: string; status: CarStatus; label: string }) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <span className="inline-flex items-center gap-2">
      <select
        aria-label={`Status for ${label}`}
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as CarStatus;
          const previous = value;
          setValue(next);
          setError(null);
          startTransition(async () => {
            const res = await setCarStatus(id, next);
            if (!res.ok) {
              setValue(previous);
              setError(res.error);
            } else {
              router.refresh();
            }
          });
        }}
        className={cn("min-h-11 rounded-card border-2 bg-white px-2 font-semibold", tone[value])}
      >
        {CAR_STATUSES.map((s) => (
          <option key={s} value={s}>{statusLabel[s]}</option>
        ))}
      </select>
      {error && <span role="alert" className="text-sm text-status-sold">{error}</span>}
    </span>
  );
}
