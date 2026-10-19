"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/cars", label: "Cars" },
  { href: "/admin/viewings", label: "Viewings" },
];

export function AdminNav() {
  return <AdminNavList pathname={usePathname()} />;
}

/** Also used as the Suspense fallback (no highlighted link). */
export function AdminNavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin" className="order-last w-full sm:order-none sm:w-auto">
      <ul className="flex gap-1">
        {links.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-card px-3 font-semibold",
                  active ? "bg-navy-950 text-white" : "text-navy-950 hover:bg-sand",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
