"use client";

import { useEffect, useRef } from "react";
import { buttonClasses } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native <dialog>: focus trapping and Escape-to-close come for free. */
export function ConfirmDialog({ open, title, body, confirmLabel, pending, error, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border border-line bg-white p-0 text-ink backdrop:bg-navy-950/50"
    >
      <div className="p-5">
        <h2 id="confirm-title" className="font-display text-2xl font-bold uppercase tracking-wide">{title}</h2>
        <div className="mt-2 text-muted">{body}</div>
        {error && <p role="alert" className="mt-3 text-status-sold">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonClasses("outline")} autoFocus>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={buttonClasses("dark", "md", "bg-status-sold hover:bg-status-sold/90")}
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
