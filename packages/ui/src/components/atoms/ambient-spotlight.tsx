import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@muziks/utils";

export type AmbientSpotlightProps = HTMLAttributes<HTMLDivElement> & {
  opacity?: number;
  children: ReactNode;
};

export function AmbientSpotlight({
  opacity = 1,
  className,
  children,
  ...props
}: AmbientSpotlightProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div
        className="muziks-spotlight pointer-events-none absolute inset-0 -z-10"
        style={{ opacity }}
        aria-hidden
      />
      {children}
    </div>
  );
}
