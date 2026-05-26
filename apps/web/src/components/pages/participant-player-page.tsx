"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ParticipantPlayerTemplate } from "@/src/components/templates/participant-player-template";
import { CatalogSearchPanel } from "@/src/components/organisms/catalog-search-panel";
import { IdentityGateDialog } from "@/src/components/organisms/identity-gate-dialog";
import { ParticipantQueueList } from "@/src/components/organisms/participant-queue-list";
import { PlayerHeroNowPlaying } from "@/src/components/organisms/player-hero-now-playing";
import { SpotifyUpcomingQueueList } from "@/src/components/organisms/spotify-upcoming-queue-list";
import {
  clearPendingVote,
  readPendingVote,
  savePendingVote,
} from "@/src/features/auth/pending-vote";
import { useParticipantSession } from "@/src/features/auth/hooks/useParticipantSession";
import { usePublicPlaybackSession } from "@/src/features/participant/hooks/usePublicPlaybackSession";
import { useMuziksCustomerQueue } from "@/src/features/queue/hooks/useMuziksCustomerQueue";

type ParticipantPlayerPageProps = {
  slug: string;
  playerId: string;
  displayName: string;
  queueTransport: "poll" | "realtime";
};

export function ParticipantPlayerPage({
  slug,
  playerId,
  displayName,
  queueTransport,
}: ParticipantPlayerPageProps) {
  const searchParams = useSearchParams();
  const { session, isAuthenticated, refresh: refreshSession } =
    useParticipantSession();
  const { session: playback, loading: playbackLoading } =
    usePublicPlaybackSession({
      slug,
      playerId,
      transport: queueTransport,
    });
  const { items, loading, error, refresh: refreshQueue } =
    useMuziksCustomerQueue({
      slug,
      playerId,
      transport: queueTransport,
    });

  const [gateOpen, setGateOpen] = useState(false);
  const [votingItemId, setVotingItemId] = useState<string | null>(null);
  const [voteNotice, setVoteNotice] = useState<string | null>(null);

  const submitVote = useCallback(
    async (queueItemId: string) => {
      setVotingItemId(queueItemId);
      setVoteNotice(null);
      try {
        const response = await fetch(`/api/players/${slug}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queueItemId }),
        });
        const body = (await response.json()) as {
          votes?: number;
          error?: string;
        };

        if (response.status === 401) {
          savePendingVote({ slug, queueItemId });
          setGateOpen(true);
          return;
        }

        if (!response.ok) {
          if (body.error === "already_voted") {
            setVoteNotice("Você já votou nesta faixa.");
          } else {
            setVoteNotice("Não foi possível registrar seu voto.");
          }
          return;
        }

        clearPendingVote();
        setVoteNotice("Voto registrado!");
        void refreshQueue();
      } finally {
        setVotingItemId(null);
      }
    },
    [refreshQueue, slug],
  );

  const handleVoteRequest = useCallback(
    (queueItemId: string) => {
      if (!isAuthenticated) {
        savePendingVote({ slug, queueItemId });
        setGateOpen(true);
        return;
      }
      void submitVote(queueItemId);
    },
    [isAuthenticated, slug, submitVote],
  );

  useEffect(() => {
    if (searchParams.get("identified") !== "1") {
      return;
    }

    void refreshSession().then(() => {
      const pending = readPendingVote(slug);
      if (pending) {
        void submitVote(pending.queueItemId);
      }
    });
  }, [searchParams, refreshSession, slug, submitVote]);

  const returnTo = `/${slug}`;

  return (
    <ParticipantPlayerTemplate slug={slug} displayName={displayName}>
      <PlayerHeroNowPlaying
        displayName={displayName}
        session={playback}
        loading={playbackLoading}
      />

      <CatalogSearchPanel
        slug={slug}
        onExploreSelect={() => {
          if (!isAuthenticated) {
            setGateOpen(true);
          } else {
            setVoteNotice(
              "Na PoC, vote nas faixas que já estão na fila abaixo.",
            );
          }
        }}
      />

      {voteNotice ? (
        <p className="text-center text-sm text-on-surface-variant" role="status">
          {voteNotice}
        </p>
      ) : null}

      <ParticipantQueueList
        items={items}
        loading={loading}
        error={error}
        onVote={handleVoteRequest}
        votingItemId={votingItemId}
      />

      <SpotifyUpcomingQueueList slug={slug} />

      <IdentityGateDialog
        open={gateOpen}
        onOpenChange={setGateOpen}
        slug={slug}
        returnTo={returnTo}
      />

      {session.status === "authenticated" && session.displayName ? (
        <p className="text-center text-xs text-on-surface-variant">
          Conectado como {session.displayName}
        </p>
      ) : null}
    </ParticipantPlayerTemplate>
  );
}
