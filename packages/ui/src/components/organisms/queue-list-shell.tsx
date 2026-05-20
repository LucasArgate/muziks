import type { ReactNode } from "react";
import { cn } from "@muziks/utils";

import { GlassPanel } from "../atoms/glass-panel";
import { glassSurfaceClass } from "../../glass/glass-surface";

export type QueueListShellSurface = "glass" | "inset";

export type QueueListShellProps = {
  title: string;
  description?: string;
  loading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: ReactNode;
  className?: string;
  /** `glass` (default) — single blur layer; `inset` — solid child inside another glass panel. */
  surface?: QueueListShellSurface;
};

function QueueListBody({
  loading,
  isEmpty,
  emptyMessage,
  children,
}: Pick<
  QueueListShellProps,
  "loading" | "isEmpty" | "emptyMessage" | "children"
>) {
  if (loading) {
    return (
      <ul className="space-y-2" aria-busy="true">
        {[0, 1, 2].map((key) => (
          <li
            key={key}
            className="h-14 animate-pulse rounded-xl bg-outline/15"
          />
        ))}
      </ul>
    );
  }

  if (isEmpty) {
    return (
      <p className="py-6 text-center text-sm text-on-surface-variant">
        {emptyMessage}
      </p>
    );
  }

  return <ul className="space-y-1">{children}</ul>;
}

export function QueueListShell({
  title,
  description,
  loading = false,
  emptyMessage = "Nada na fila por enquanto.",
  isEmpty = false,
  children,
  className,
  surface = "glass",
}: QueueListShellProps) {
  const header = (
    <header className="mb-4 space-y-1">
      <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      {description ? (
        <p className="text-xs text-on-surface-variant">{description}</p>
      ) : null}
    </header>
  );

  const body = (
    <QueueListBody
      loading={loading}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
    >
      {children}
    </QueueListBody>
  );

  if (surface === "inset") {
    return (
      <section
        className={cn(
          glassSurfaceClass({ variant: "inset" }),
          "p-4",
          className,
        )}
      >
        {header}
        {body}
      </section>
    );
  }

  return (
    <GlassPanel
      as="section"
      variant="functional"
      radius="lg"
      className={cn("p-4", className)}
    >
      {header}
      {body}
    </GlassPanel>
  );
}
