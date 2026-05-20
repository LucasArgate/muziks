import type { ReactNode } from "react";
import { cn } from "@muziks/utils";

export type GradientTextProps = {
  children: ReactNode;
  className?: string;
};

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-[#3aa0ff] to-[#0066B2] bg-clip-text text-transparent",
        className,
      )}
    >
      {children}
    </span>
  );
}
