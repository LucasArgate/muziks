import { cn } from "@muziks/utils";

import {
  MUZIKS_BRAND_DIMENSIONS,
  MUZIKS_BRAND_PATHS,
} from "../brand";

/**
 * `light` — wordmark claro (fundo escuro); `dark` — wordmark escuro (fundo claro);
 * `iconOnly` — marcador dos três quadrados.
 * @see docs/DESIGN.md §7
 */
export type MuziksLogoVariant = "light" | "dark" | "iconOnly";

export type MuziksLogoProps = {
  className?: string;
  /** Override asset URL (ex.: testes). Preferir `variant`. */
  src?: string;
  variant?: MuziksLogoVariant;
};

const variantConfig = {
  light: {
    src: MUZIKS_BRAND_PATHS.onDarkBg,
    ...MUZIKS_BRAND_DIMENSIONS.onDarkBg,
    defaultClassName: "h-10 w-auto md:h-12",
  },
  dark: {
    src: MUZIKS_BRAND_PATHS.onLightBg,
    ...MUZIKS_BRAND_DIMENSIONS.onLightBg,
    defaultClassName: "h-10 w-auto md:h-12",
  },
  iconOnly: {
    src: MUZIKS_BRAND_PATHS.icon,
    ...MUZIKS_BRAND_DIMENSIONS.icon,
    defaultClassName: "h-10 w-10",
  },
} as const;

export function MuziksLogo({
  className,
  src,
  variant = "light",
}: MuziksLogoProps) {
  const config = variantConfig[variant];
  const imageSrc = src ?? config.src;

  return (
    <img
      src={imageSrc}
      alt="Muziks"
      width={config.width}
      height={config.height}
      className={cn(config.defaultClassName, className)}
      decoding="async"
    />
  );
}
