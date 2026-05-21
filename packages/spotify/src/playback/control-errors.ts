export type SpotifyControlErrorCode =
  | "spotify_restriction"
  | "spotify_no_active_device"
  | "spotify_control_failed";

export type MappedSpotifyControlError = {
  status: 403 | 404 | 502;
  code: SpotifyControlErrorCode;
  message: string;
};

const CONTROL_MESSAGES: Record<SpotifyControlErrorCode, string> = {
  spotify_restriction:
    "O Spotify bloqueou este comando (ex.: rádio, podcast ou limite do plano).",
  spotify_no_active_device:
    "Nenhum dispositivo ativo. Abra o Spotify ou transfira a reprodução para este navegador.",
  spotify_control_failed:
    "Não foi possível controlar a reprodução. Tente de novo ou selecione o dispositivo.",
};

export function controlErrorMessage(code: SpotifyControlErrorCode): string {
  return CONTROL_MESSAGES[code];
}

/** Maps Web API / SDK failures to stable API codes (strips OAuth noise from the facade SDK). */
export function mapSpotifyPlaybackControlError(
  error: unknown,
): MappedSpotifyControlError {
  const raw = error instanceof Error ? error.message : String(error);

  if (/Restriction violated|restriction/i.test(raw)) {
    return {
      status: 403,
      code: "spotify_restriction",
      message: CONTROL_MESSAGES.spotify_restriction,
    };
  }

  if (
    /No active device|Player is not active|device not found/i.test(raw) ||
    /"status"\s*:\s*404/.test(raw)
  ) {
    return {
      status: 404,
      code: "spotify_no_active_device",
      message: CONTROL_MESSAGES.spotify_no_active_device,
    };
  }

  return {
    status: 502,
    code: "spotify_control_failed",
    message: CONTROL_MESSAGES.spotify_control_failed,
  };
}
