"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/components/layout/nav-links";
import { siteConfig } from "@/config/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex size-11 items-center justify-center rounded-card text-navy-950 hover:bg-sand"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b border-line bg-white shadow-sm"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2">
            {navLinks.map((link) => (
              <li key={link.href} className="border-b border-line last:border-0">
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center font-display text-xl font-semibold uppercase tracking-wide text-navy-950 aria-[current=page]:text-orange-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="py-3">
              <a href={siteConfig.contact.phoneHref} className="text-sm text-muted">
                Call {siteConfig.contact.phoneDisplay}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
