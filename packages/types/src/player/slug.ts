export const RESERVED_PLAYER_SLUGS = [
  "login",
  "logout",
  "create",
  "register",
  "forget",
] as const;

export type ReservedPlayerSlug = (typeof RESERVED_PLAYER_SLUGS)[number];

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export type Slug = string;

export function isReservedPlayerSlug(slug: string): slug is ReservedPlayerSlug {
  return (RESERVED_PLAYER_SLUGS as readonly string[]).includes(slug);
}

export function isValidPlayerSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (!SLUG_PATTERN.test(normalized)) return false;
  if (isReservedPlayerSlug(normalized)) return false;
  return true;
}

export function normalizePlayerSlug(slug: string): string {
  return slug.trim().toLowerCase();
}
