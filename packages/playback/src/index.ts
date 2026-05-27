export {
  runBackgroundPlaybackOrchestrator,
  tickBackgroundPlayer,
  type BackgroundPlaybackOrchestratorPorts,
  type BackgroundPlaybackSession,
  type CurrentPlaybackSample,
  type BackgroundTickSampleContext,
  type BackgroundTickSampleHook,
  type PlaybackAccessTokenProvider,
  type PlaybackSessionSnapshotPublisher,
  type SpotifyQueueSnapshotPublisher,
  type RunPlaybackOrchestratorResult,
  type TickPlayerResult,
} from "./application/background-playback-orchestrator";
export {
  PlaybackStatePoller,
  type PlaybackStatePollerOptions,
} from "./application/playback-state-poller";
export {
  claimPlayersForBackgroundTick,
  createDrizzleSpotifyBackgroundPlaybackPorts,
  isPlayerEligibleForBackgroundTick,
  type DrizzleSpotifyBackgroundPlaybackOptions,
  type PlaybackSessionRow,
} from "./infrastructure/drizzle-spotify-background-playback";
export {
  fingerprintPlaybackState,
  hasSemanticPlaybackChange,
  playbackSessionToNormalized,
  resolvePersistedProgressMs,
  resolvePlaybackSessionStatus,
  type PlaybackSessionProjection,
} from "./domain/playback-state";
export { fingerprintSpotifyQueue } from "./domain/spotify-queue";
export {
  PLAYBACK_ACTIVE_WINDOW_MS,
  PLAYBACK_BROWSER_HEALTH_WINDOW_MS,
  PLAYBACK_CLIENT_IDLE_POLL_MS,
  PLAYBACK_CLIENT_MAX_BACKOFF_MULTIPLIER,
  PLAYBACK_CLIENT_PAUSED_POLL_MS,
  PLAYBACK_CLIENT_PLAYING_POLL_MS,
  PLAYBACK_ENDING_SOON_MS,
  PLAYBACK_ERROR_BACKOFF_MS,
  PLAYBACK_IDLE_NEXT_TICK_MS,
  PLAYBACK_PAUSED_NEXT_TICK_MS,
  PLAYBACK_PLAYING_NEXT_TICK_MS,
  resolveNextPlaybackTickAt,
  type PlaybackTickScheduleInput,
} from "./domain/polling";
