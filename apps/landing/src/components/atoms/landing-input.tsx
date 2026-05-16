import type { InputHTMLAttributes } from "react";
import { cn } from "@muziks/utils";

export type LandingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function LandingInput({ label, id, className, ...props }: LandingInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-xs font-medium uppercase tracking-wide text-on-surface-variant">
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 backdrop-blur-glass focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40",
          className,
        )}
        {...props}
      />
    </div>
  );
}
