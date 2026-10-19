import Link from "next/link";
import { CarForm } from "@/components/admin/car-form";

export const metadata = { title: "Add a car" };

export default function NewCarPage() {
  return (
    <>
      <Link href="/admin/cars" className="inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-navy-950">
        ← Cars
      </Link>
      <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Add a car</h1>
      <p className="mt-1 mb-6 text-muted">
        The stock number and web address are created automatically. You&apos;ll add photos on the next screen.
      </p>
      <CarForm />
    </>
  );
}
