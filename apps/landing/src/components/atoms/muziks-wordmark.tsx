import Image from "next/image";
import { cn } from "@muziks/utils";

import { LANDING_ASSETS } from "@/src/config/landing-content";

/** Intrinsic size of `public/brand/muziks-white.png` (horizontal: faders + wordmark). */
const WORDMARK_WIDTH = 281;
const WORDMARK_HEIGHT = 54;

export type MuziksWordmarkProps = {
  className?: string;
  /** `nav` — header; `footer` — rodapé (ligeiramente maior). */
  size?: "nav" | "footer";
  priority?: boolean;
};

const sizeClass = {
  nav: "h-6 w-auto max-w-none",
  footer: "h-7 w-auto max-w-none",
} as const;

const sizePx = {
  nav: { height: 24, width: 125 },
  footer: { height: 28, width: 146 },
} as const;

/**
 * Wordmark institucional para fundo escuro (`muziks-white.png`).
 * Layout horizontal (ícone de faders + “muziks”) — alinhado ao asset em `apps/web`.
 */
export function MuziksWordmark({
  className,
  size = "nav",
  priority,
}: MuziksWordmarkProps) {
  const dims = sizePx[size];

  return (
    <Image
      src={LANDING_ASSETS.logoWhite}
      alt="Muziks"
      width={WORDMARK_WIDTH}
      height={WORDMARK_HEIGHT}
      sizes={`${dims.width}px`}
      className={cn("block shrink-0", sizeClass[size], className)}
      priority={priority ?? size === "nav"}
    />
  );
}
