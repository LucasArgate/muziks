import type { ReactNode } from "react";
import { cn } from "@muziks/utils";

import { GlassPanel } from "../atoms/glass-panel";

export type QueueListShellProps = {
  title: string;
  description?: string;
  loading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: ReactNode;
  className?: string;
};

export function QueueListShell({
  title,
  description,
  loading = false,
  emptyMessage = "Nada na fila por enquanto.",
  isEmpty = false,
  children,
  className,
}: QueueListShellProps) {
  return (
    <GlassPanel variant="functional" className={cn("p-4", className)}>
      <header className="mb-4 space-y-1">
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
        {description ? (
          <p className="text-xs text-on-surface-variant">{description}</p>
        ) : null}
      </header>

      {loading ? (
        <ul className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((key) => (
            <li
              key={key}
              className="h-14 animate-pulse rounded-xl bg-outline/15"
            />
          ))}
        </ul>
      ) : isEmpty ? (
        <p className="py-6 text-center text-sm text-on-surface-variant">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-1">{children}</ul>
      )}
    </GlassPanel>
  );
}
