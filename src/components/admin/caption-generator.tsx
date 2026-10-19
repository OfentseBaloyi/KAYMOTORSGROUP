"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";

/** Shows the generated Instagram caption with a one-tap copy button. */
export function CaptionGenerator({ caption }: { caption: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked (e.g. non-HTTPS on a phone): select the text instead.
      const el = document.getElementById("ig-caption") as HTMLTextAreaElement | null;
      el?.select();
    }
  };

  return (
    <div>
      <button type="button" onClick={copy} className={buttonClasses("primary", "lg")}>
        {copied ? <Check size={20} aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Copied" : "Copy caption"}</span>
      </button>
      <label htmlFor="ig-caption" className="mt-4 block text-sm font-semibold">
        Preview
      </label>
      <textarea
        id="ig-caption"
        readOnly
        value={caption}
        rows={Math.min(24, caption.split("\n").length + 1)}
        className="mt-1 block w-full rounded-card border border-line bg-paper p-3 font-sans text-sm"
      />
      <p className="mt-1 text-xs text-muted">Wording lives in src/config/instagram-caption.ts.</p>
    </div>
  );
}
