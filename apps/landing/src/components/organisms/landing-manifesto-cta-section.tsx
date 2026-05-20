import Image from "next/image";
import { LandingCtaButton } from "@/src/components/atoms/landing-cta-button";
import { LANDING_ASSETS, LANDING_URLS } from "@/src/config/landing-content";

export function LandingManifestoCtaSection() {
  return (
    <section
      id="manifesto"
      className="relative overflow-hidden px-6 py-28 md:py-36"
    >
      <div className="muziks-spotlight absolute inset-0 -z-10 opacity-70" />
      <div className="mx-auto max-w-4xl text-center">
        <Image
          src={LANDING_ASSETS.icon}
          alt=""
          width={64}
          height={64}
          className="mx-auto h-14 w-14 rounded-2xl"
          aria-hidden
        />
        <h2 className="mt-8 text-balance text-4xl font-semibold leading-tight tracking-tight text-on-surface md:text-6xl">
          A música conecta.
          <span className="block text-on-surface-variant">
            A fila precisa de acordo.
          </span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          O Muziks não inventa esse vínculo: assume o chão humano da música e
          pergunta como compartilhar a fila — com regra explícita — para que a
          conexão não vire disputa.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <LandingCtaButton
            href={LANDING_URLS.app}
            variant="primary"
            external
            showArrow
            className="px-7 py-3.5 shadow-[0_10px_40px_-10px_rgba(0,102,178,0.7)]"
          >
            Abrir App
          </LandingCtaButton>
          <LandingCtaButton href={LANDING_URLS.manifesto} variant="secondary" external>
            Ler o manifesto
          </LandingCtaButton>
        </div>
      </div>
    </section>
  );
}
