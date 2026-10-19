"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteCar } from "@/lib/actions/admin";
import { cn } from "@/lib/cn";

interface DeleteCarButtonProps {
  id: string;
  label: string;
  /** Where to go after deleting (e.g. back to the list from the edit page). */
  redirectTo?: string;
  className?: string;
}

export function DeleteCarButton({ id, label, redirectTo, className }: DeleteCarButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className={cn(
          "inline-flex min-h-11 items-center gap-1 rounded-card px-3 font-semibold text-status-sold hover:bg-status-sold/10",
          className,
        )}
      >
        <Trash2 size={18} aria-hidden="true" /> Delete
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this car?"
        body={
          <>
            <strong className="text-ink">{label}</strong> and all its photos will be removed for good. If it
            sold, consider marking it <em>Sold</em> instead so it shows under &quot;Recently sold&quot;.
          </>
        }
        confirmLabel="Delete car"
        pending={pending}
        error={error}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            const res = await deleteCar(id);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            setOpen(false);
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          })
        }
      />
    </>
  );
}
