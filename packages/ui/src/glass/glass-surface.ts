import { cn } from "@muziks/utils";

/** Do not stack functional/liquid surfaces with backdrop-filter (DESIGN.md §3). */
export type GlassSurfaceVariant = "functional" | "liquid" | "inset";

export type GlassSurfaceRadius = "default" | "lg" | "pill" | "liquid";

export type GlassSurfaceOptions = {
  variant?: GlassSurfaceVariant;
  radius?: GlassSurfaceRadius;
  /** Solid inset surface — use inside an existing glass panel. */
  nested?: boolean;
  className?: string;
};

const radiusClass: Record<GlassSurfaceRadius, string> = {
  default: "rounded-2xl",
  lg: "rounded-3xl",
  pill: "rounded-full",
  liquid: "",
};

/** Landing-style hover on glass chips and nav items. */
export const glassHoverClass = "transition hover:bg-white/[0.07]";

export function glassSurfaceClass({
  variant = "functional",
  radius = "default",
  nested = false,
  className,
}: GlassSurfaceOptions = {}): string {
  const resolvedVariant = nested ? "inset" : variant;
  const resolvedRadius =
    resolvedVariant === "liquid" ? "liquid" : radius;

  const base =
    resolvedVariant === "inset"
      ? "rounded-2xl border border-white/[0.12] bg-surface-container"
      : resolvedVariant === "liquid"
        ? "muziks-liquid-glass"
        : "muziks-glass";

  const radiusCn =
    resolvedVariant === "liquid"
      ? ""
      : radiusClass[resolvedRadius];

  return cn(base, radiusCn, className);
}
