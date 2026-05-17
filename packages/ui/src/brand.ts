/** Official Muziks brand assets — source of truth: docs/images/identity/ */

export const MUZIKS_BRAND_PATHS = {
  /** Wordmark for dark backgrounds (muziks-white.png). */
  onDarkBg: "/brand/muziks-white.png",
  /** Wordmark for light backgrounds (muziks-dark.png). */
  onLightBg: "/brand/muziks-dark.png",
  /** App icon — three blue squares (Muziks-152.png). */
  icon: "/brand/Muziks-152.png",
} as const;

export const MUZIKS_BRAND_DIMENSIONS = {
  onDarkBg: { width: 281, height: 54 },
  onLightBg: { width: 722, height: 139 },
  icon: { width: 152, height: 152 },
} as const;
