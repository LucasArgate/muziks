import { cn } from "@muziks/utils";

export type LandingBadgeProps = {
  label: string;
  className?: string;
};

export function LandingBadge({ label, className }: LandingBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant",
        className,
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
      {label}
    </span>
  );
}
