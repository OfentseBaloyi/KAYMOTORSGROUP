import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "outline" | "ghost";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  // Navy text on orange: 5.4:1. White on orange would fail AA.
  primary: "bg-orange-500 text-navy-950 hover:bg-orange-600",
  dark: "bg-navy-950 text-white hover:bg-navy-800",
  outline: "border-2 border-navy-950 text-navy-950 hover:bg-navy-950 hover:text-white",
  ghost: "text-navy-950 underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

/** Shared button styling for <button> and <Link>. Min height 44px for tap targets. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-card font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    extra,
  );
}
