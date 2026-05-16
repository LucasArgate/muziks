import type { ButtonHTMLAttributes } from "react";
import { cn } from "@muziks/utils";

export type LandingButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function LandingButton({ className, type = "submit", ...props }: LandingButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        className,
      )}
      {...props}
    />
  );
}
