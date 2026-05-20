"use client";

import type { DequeueNextQueueItemResult } from "@muziks/types";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";

type DequeueTestButtonProps = {
  slug: string;
  onDequeued?: (result: DequeueNextQueueItemResult) => void;
};

export function DequeueTestButton({ slug, onDequeued }: DequeueTestButtonProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/players/${slug}/queue/dequeue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "manual_test",
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const body = (await response.json()) as DequeueNextQueueItemResult & {
        error?: string;
      };

      if (!response.ok) {
        setMessage(body.error ?? "Falha ao avançar a fila.");
        return;
      }

      onDequeued?.(body);

      if (body.dequeued) {
        setMessage(
          `Retirado: ${body.dequeued.title} — próximo: ${body.head?.title ?? "fila vazia"}`,
        );
      } else {
        setMessage("Fila Muziks vazia (nenhum item em estado queued).");
      }
    } catch {
      setMessage("Erro de rede ao testar dequeue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => void handleClick()}
      >
        {pending ? "Avançando…" : "Testar próxima da fila Muziks"}
      </Button>
      {message ? (
        <p className="text-center text-xs text-on-surface-variant">{message}</p>
      ) : null}
    </div>
  );
}
