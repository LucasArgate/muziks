export type AgentDebugLogInput = {
  hypothesisId: string;
  location: string;
  message: string;
  data: Record<string, unknown>;
  runId?: string;
  sessionId?: string;
  sameOriginPath?: string;
};

const DEFAULT_SESSION_ID = "f48c1c";
const DEFAULT_RUN_ID = "initial";
const DEBUG_ENDPOINT =
  "http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef";

export function sendAgentDebugLog(input: AgentDebugLogInput): void {
  if (typeof fetch === "undefined") {
    return;
  }

  const sessionId = input.sessionId ?? DEFAULT_SESSION_ID;
  const payload = {
    sessionId,
    runId: input.runId ?? DEFAULT_RUN_ID,
    hypothesisId: input.hypothesisId,
    location: input.location,
    message: input.message,
    data: input.data,
    timestamp: Date.now(),
  };

  // #region agent log
  fetch(DEBUG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": sessionId,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});

  if (input.sameOriginPath) {
    fetch(input.sameOriginPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
  // #endregion
}
