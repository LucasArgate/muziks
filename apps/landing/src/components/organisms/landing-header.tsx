import { MuziksWordmark } from "@/src/components/atoms/muziks-wordmark";
import { LandingNav } from "@/src/components/molecules/landing-nav";
import { LANDING_URLS } from "@/src/config/landing-content";

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between gap-4 rounded-full px-5 py-3 muziks-glass">
        <a
          href="#top"
          className="flex shrink-0 items-center"
          aria-label="Muziks — início"
        >
          <MuziksWordmark size="nav" />
        </a>
        <LandingNav />
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={LANDING_URLS.player}
            target="_blank"
            rel="noreferrer"
            className="muziks-glass inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-on-surface transition hover:bg-white/10"
          >
            Player
          </a>
          <a
            href={LANDING_URLS.app}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Abrir App
          </a>
        </div>
      </div>
    </header>
  );
}
