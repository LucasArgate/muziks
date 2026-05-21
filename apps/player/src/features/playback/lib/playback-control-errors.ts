const CONTROL_MESSAGES = {
  spotify_restriction:
    "O Spotify bloqueou este comando (ex.: rádio, podcast ou limite do plano).",
  spotify_no_active_device:
    "Nenhum dispositivo ativo. Abra o Spotify ou transfira a reprodução para este navegador.",
  spotify_control_failed:
    "Não foi possível controlar a reprodução. Tente de novo ou selecione o dispositivo.",
} as const;

type SpotifyControlErrorCode = keyof typeof CONTROL_MESSAGES;

export function resolvePlaybackControlErrorMessage(
  body: { error?: string; message?: string } | null,
  fallback = "Não foi possível controlar a reprodução.",
): string {
  if (body?.message?.trim()) {
    return body.message;
  }
  const code = body?.error;
  if (code && code in CONTROL_MESSAGES) {
    return CONTROL_MESSAGES[code as SpotifyControlErrorCode];
  }
  return fallback;
}
