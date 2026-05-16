import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@muziks/utils";

export type GlassPanelVariant = "functional" | "liquid";

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassPanelVariant;
  children: ReactNode;
};

const variantClass: Record<GlassPanelVariant, string> = {
  functional:
    "rounded-2xl border border-white/[0.12] bg-white/[0.08] backdrop-blur-glass",
  liquid:
    "rounded-3xl border border-white/[0.14] bg-glass-liquid backdrop-blur-liquid shadow-2xl",
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
