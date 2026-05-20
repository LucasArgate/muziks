import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@muziks/utils";

export type GlassPanelVariant = "functional" | "liquid";

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassPanelVariant;
  children: ReactNode;
};

const variantClass: Record<GlassPanelVariant, string> = {
  functional: "muziks-glass rounded-2xl",
  liquid: "muziks-liquid-glass",
};

export function GlassPanel({
  variant = "functional",
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div className={cn(variantClass[variant], className)} {...props}>
      {children}
    </div>
  );
}
