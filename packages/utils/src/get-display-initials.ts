export function getDisplayInitials(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();
  if (!trimmed) {
    return "?";
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }

  const word = parts[0]!;
  return word.length >= 2
    ? word.slice(0, 2).toUpperCase()
    : word[0]!.toUpperCase();
}
