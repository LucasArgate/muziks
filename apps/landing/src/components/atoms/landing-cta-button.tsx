import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@muziks/utils";
import { ArrowRightIcon } from "@/src/components/atoms/arrow-right-icon";

export type LandingCtaVariant = "primary" | "secondary" | "white";

export type LandingCtaButtonProps = {
  href: string;
  children: ReactNode;
  variant?: LandingCtaVariant;
  external?: boolean;
  showArrow?: boolean;
  className?: string;
};

const variantClass: Record<LandingCtaVariant, string> = {
  primary:
    "rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_40px_-10px_rgba(0,102,178,0.6)] transition hover:brightness-110",
  secondary:
    "muziks-glass rounded-full px-6 py-3 text-sm font-semibold text-on-surface transition hover:bg-white/10",
  white:
    "rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90",
};

export function LandingCtaButton({
  href,
  children,
  variant = "primary",
  external = false,
  showArrow = false,
  className,
}: LandingCtaButtonProps) {
  const classes = cn(
    "inline-flex items-center gap-2",
    variantClass[variant],
    className,
  );

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classes}
        target={external || href.startsWith("http") ? "_blank" : undefined}
        rel={external || href.startsWith("http") ? "noreferrer" : undefined}
      >
        {children}
        {showArrow ? <ArrowRightIcon /> : null}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {showArrow ? <ArrowRightIcon /> : null}
    </Link>
  );
}
