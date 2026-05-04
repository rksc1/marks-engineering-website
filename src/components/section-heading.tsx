import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p> : null}
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-zinc-950 md:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-zinc-600 md:text-lg">{description}</p> : null}
    </div>
  );
}
