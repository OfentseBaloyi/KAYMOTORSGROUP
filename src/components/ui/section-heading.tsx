import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

/** Condensed uppercase heading with the logo's double stripe underneath. */
export function SectionHeading({ children, as: Tag = "h2", id, className }: SectionHeadingProps) {
  return (
    <div className={className}>
      <Tag
        id={id}
        className={cn(
          "font-display font-bold uppercase leading-none tracking-wide text-navy-950",
          Tag === "h1" ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
        )}
      >
        {children}
      </Tag>
      <div className="kombi-stripe mt-3 w-16" aria-hidden="true" />
    </div>
  );
}
