"use client";

import type { QueueItemDto } from "@muziks/types";
import { QueueListShell, QueueTrackRow } from "@muziks/ui";

type MuziksCustomerQueueListProps = {
  items: QueueItemDto[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

export function MuziksCustomerQueueList({
  items,
  loading = false,
  error = null,
  emptyMessage = "Nenhum pedido na fila de clientes.",
}: MuziksCustomerQueueListProps) {
  const visible = items.filter((item) => item.state !== "played");

  return (
    <QueueListShell
      title="Fila de clientes"
      description="Ordenada por votos; regras do player aplicam na próxima fase."
      loading={loading && visible.length === 0}
      isEmpty={!loading && visible.length === 0}
      emptyMessage={
        error ? "Não foi possível carregar a fila de clientes." : emptyMessage
      }
    >
      {visible.map((item, index) => (
        <QueueTrackRow
          key={item.id}
          title={item.title}
          artist={item.artist}
          positionLabel={String(index + 1)}
          highlight={item.state === "playing"}
          trailing={
            <span className="rounded-full bg-outline/20 px-2 py-0.5 text-xs font-medium text-on-surface-variant">
              {item.votes} votos
            </span>
          }
        />
      ))}
    </QueueListShell>
  );
}
