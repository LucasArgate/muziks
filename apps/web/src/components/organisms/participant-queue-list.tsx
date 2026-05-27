"use client";

import type { QueueItemDto } from "@muziks/types";
import { QueueListShell, QueueTrackRow } from "@muziks/ui";

import { VoteCountBadge } from "@/src/components/atoms/vote-count-badge";
import { VoteActionButton } from "@/src/components/molecules/vote-action-button";

type ParticipantQueueListProps = {
  items: QueueItemDto[];
  loading?: boolean;
  error?: string | null;
  onVote: (queueItemId: string) => void;
  votingItemId?: string | null;
};

export function ParticipantQueueList({
  items,
  loading = false,
  error = null,
  onVote,
  votingItemId = null,
}: ParticipantQueueListProps) {
  const visible = items.filter((item) => item.state !== "played");

  return (
    <QueueListShell
      title="Fila do espaço"
      description="Ordenada por votos — toque em + para apoiar uma faixa."
      loading={loading && visible.length === 0}
      isEmpty={!loading && visible.length === 0}
      emptyMessage={
        error
          ? "Não foi possível carregar a fila."
          : "Ainda não há músicas na fila. Quando alguém sugerir, elas aparecem aqui para você votar."
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
            <div className="flex items-center gap-2">
              <VoteCountBadge votes={item.votes} />
              <VoteActionButton
                onClick={() => onVote(item.id)}
                disabled={votingItemId === item.id}
              />
            </div>
          }
        />
      ))}
    </QueueListShell>
  );
}
