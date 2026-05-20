import { cn } from "@muziks/utils";

const BAR_HEIGHTS = [0.6, 1, 0.4, 0.85, 0.5] as const;

export type EqLogoProps = {
  className?: string;
};

export function EqLogo({ className }: EqLogoProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-5 items-end gap-[3px]", className)}
    >
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="muziks-eq-bar block w-[3px] rounded-sm bg-on-surface"
          style={{
            height: `${h * 100}%`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </span>
  );
}
