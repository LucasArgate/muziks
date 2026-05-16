import { cn } from "@muziks/utils";

export type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  titleId?: string;
  className?: string;
};

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  titleId,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        className,
      )}
    >
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
