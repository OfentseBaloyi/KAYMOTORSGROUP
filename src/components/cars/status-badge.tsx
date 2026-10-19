import { cn } from "@/lib/cn";
import { statusLabel } from "@/lib/format";
import type { CarStatus } from "@/lib/types";

const styles: Record<CarStatus, string> = {
  available: "bg-status-available text-white",
  reserved: "bg-status-reserved text-white",
  sold: "bg-status-sold text-white",
};

export function StatusBadge({ status, className }: { status: CarStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm px-2 py-0.5 font-display text-sm font-bold uppercase tracking-wider",
        styles[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
