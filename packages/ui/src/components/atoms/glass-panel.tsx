import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@muziks/utils";

import {
  glassSurfaceClass,
  type GlassSurfaceRadius,
  type GlassSurfaceVariant,
} from "../../glass/glass-surface";

export type GlassPanelVariant = "functional" | "liquid";

export type GlassPanelRadius = GlassSurfaceRadius;

export type GlassPanelElement = "div" | "section" | "aside";

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassPanelVariant;
  radius?: GlassPanelRadius;
  /** Solid inset — no backdrop-filter (child of another glass panel). */
  nested?: boolean;
  as?: GlassPanelElement;
  /** Soft radial glow behind liquid panels (landing now-playing). */
  glow?: boolean;
  children: ReactNode;
};

export function GlassPanel({
  variant = "functional",
  radius = "default",
  nested = false,
  as: Component = "div",
  glow = false,
  className,
  children,
  ...props
}: GlassPanelProps) {
  const surfaceVariant: GlassSurfaceVariant = nested
    ? "inset"
    : variant;

  const content = (
    <Component
      className={glassSurfaceClass({
        variant: surfaceVariant,
        radius: variant === "liquid" ? "liquid" : radius,
        nested,
        className,
      })}
      {...props}
    >
      {children}
    </Component>
  );

  if (!glow || variant !== "liquid") {
    return content;
  }

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,102,178,0.25), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {content}
    </div>
  );
}
