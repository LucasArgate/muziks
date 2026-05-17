const BANNER =
  "════════════════════════════════════════════════════════════════";

type LogKind = "tick" | "event" | "transition" | "warn" | "skip";

const KIND_LABEL: Record<LogKind, string> = {
  tick: "TICK",
  event: "EVENT",
  transition: "TRANSITION",
  warn: "WARN",
  skip: "SKIP",
};

/**
 * Log chamativo para testar pause BT, resume, fim de faixa, etc.
 * Filtrar no terminal: `MUZIKS_PLAYBACK`
 */
export function logPlaybackLifecycle(
  kind: LogKind,
  tag: string,
  payload: Record<string, unknown>,
): void {
  const ts = new Date().toISOString();
  const label = KIND_LABEL[kind];

  console.log(`\n${BANNER}`);
  console.log(`>>> MUZIKS_PLAYBACK [${label}] ${tag} @ ${ts}`);
  console.log(JSON.stringify(payload, null, 2));
  console.log(`${BANNER}\n`);
}
