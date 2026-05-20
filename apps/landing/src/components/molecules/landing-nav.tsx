import { cn } from "@muziks/utils";
import { LANDING_URLS } from "@/src/config/landing-content";

export type LandingNavProps = {
  className?: string;
};

export function LandingNav({ className }: LandingNavProps) {
  const linkClass =
    "text-sm text-on-surface-variant transition hover:text-on-surface";

  return (
    <nav
      className={cn("hidden items-center gap-7 md:flex", className)}
      aria-label="Principal"
    >
      <a href="#como-funciona" className={linkClass}>
        Como funciona
      </a>
      <a href="#para-bares" className={linkClass}>
        Para bares
      </a>
      <a href="#manifesto" className={linkClass}>
        Manifesto
      </a>
      <a
        href={LANDING_URLS.github}
        target="_blank"
        rel="noreferrer"
        className={linkClass}
      >
        GitHub
      </a>
    </nav>
  );
}

