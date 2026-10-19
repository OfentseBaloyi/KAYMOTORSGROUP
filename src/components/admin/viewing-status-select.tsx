"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setViewingStatus } from "@/lib/actions/admin";
import { viewingStatusLabel } from "@/lib/format";
import { VIEWING_STATUSES, type ViewingStatus } from "@/lib/types";

export function ViewingStatusSelect({ id, status }: { id: string; status: ViewingStatus }) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Request status</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ViewingStatus;
          const previous = value;
          setValue(next);
          setError(null);
          startTransition(async () => {
            const res = await setViewingStatus(id, next);
            if (!res.ok) {
              setValue(previous);
              setError(res.error);
            } else {
              router.refresh();
            }
          });
        }}
        className="min-h-11 rounded-card border border-line bg-white px-3 font-semibold"
      >
        {VIEWING_STATUSES.map((s) => (
          <option key={s} value={s}>{viewingStatusLabel[s]}</option>
        ))}
      </select>
      {error && <span role="alert" className="text-status-sold">{error}</span>}
    </label>
  );
}
