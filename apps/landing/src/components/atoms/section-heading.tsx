import { cn } from "@muziks/utils";

export type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  titleId?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  titleId,
  className,
}: SectionHeadingProps) {
  if (eyebrow) {
    return (
      <div className={cn(align === "center" && "text-center", className)}>
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-primary">
          <span className="inline-block h-px w-6 bg-primary/60" />
          {eyebrow}
        </span>
        <h2
          id={titleId}
          className="mt-4 max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-on-surface md:text-5xl"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 text-lg font-medium text-on-surface-variant md:text-xl">
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <h2
        id={titleId}
        className="text-3xl font-semibold tracking-tight text-on-surface md:text-4xl"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-lg font-medium text-primary md:text-xl">{subtitle}</p>
      ) : null}
    </div>
  );
}
