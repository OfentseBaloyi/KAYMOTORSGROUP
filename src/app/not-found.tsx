import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="font-display text-8xl leading-none font-bold text-orange-500 md:text-9xl" aria-hidden="true">
            404
          </p>
          <div className="kombi-stripe mt-4 w-32" aria-hidden="true" />
          <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-wide">
            Wrong turn.
          </h1>
          <p className="mt-3 max-w-md text-lg text-muted">
            This page doesn&apos;t exist, or the car has been taken off the site.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cars" className={buttonClasses("dark", "lg")}>
              See what&apos;s in stock
            </Link>
            <Link href="/" className={buttonClasses("outline", "lg")}>
              Home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
