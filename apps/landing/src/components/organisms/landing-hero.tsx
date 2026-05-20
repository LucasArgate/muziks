import Image from "next/image";
import { EqLogo } from "@/src/components/atoms/eq-logo";
import { GradientText } from "@/src/components/atoms/gradient-text";
import { LandingBadge } from "@/src/components/atoms/landing-badge";
import { LandingCtaButton } from "@/src/components/atoms/landing-cta-button";
import { NowPlayingCard } from "@/src/components/molecules/now-playing-card";
import { LANDING_ASSETS, LANDING_URLS } from "@/src/config/landing-content";

export function LandingHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pb-24 pt-36 md:pb-32 md:pt-44"
    >
      <div className="muziks-spotlight absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 opacity-40" aria-hidden>
        <Image
          src={LANDING_ASSETS.heroArtwork}
          alt=""
          fill
          className="object-cover"
          style={{
            filter: "blur(40px) saturate(1.1)",
            transform: "scale(1.2)",
          }}
          sizes="100vw"
          priority
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/60 to-surface" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <LandingBadge label="Player democrático" />
          <h1 className="mt-6 text-balance font-sans text-5xl font-bold leading-[1.05] tracking-tight text-on-surface md:text-7xl">
            Música compartilhada
            <span className="block text-on-surface-variant">
              com <GradientText>regras claras</GradientText>.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
            O Muziks deixa o público escolher e votar na fila do bar — por lugar,
            por dia e por política — e trata todo mundo bem quando a escolha não
            cabe. Democracia da fila, não anarquia.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LandingCtaButton href={LANDING_URLS.app} variant="primary" showArrow>
              Sou cliente — quero pedir música
            </LandingCtaButton>
            <a
              href="#para-bares"
              className="muziks-glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-on-surface transition hover:bg-white/10"
            >
              Sou dono do bar
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-on-surface-variant/80">
            <div className="flex items-center gap-2">
              <EqLogo />
              <span>Hoje em testes em bares parceiros</span>
            </div>
          </div>
        </div>

        <NowPlayingCard />
      </div>
    </section>
  );
}
