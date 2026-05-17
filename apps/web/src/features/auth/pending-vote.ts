const PENDING_VOTE_KEY = "muziks:pending-vote";

export type PendingVote = {
  slug: string;
  queueItemId: string;
};

export function savePendingVote(vote: PendingVote): void {
  sessionStorage.setItem(PENDING_VOTE_KEY, JSON.stringify(vote));
}

export function readPendingVote(slug: string): PendingVote | null {
  try {
    const raw = sessionStorage.getItem(PENDING_VOTE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PendingVote;
    if (parsed.slug !== slug) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingVote(): void {
  sessionStorage.removeItem(PENDING_VOTE_KEY);
}
