import { SectionHeading } from "@/src/components/atoms/section-heading";
import { LandingCtaButton } from "@/src/components/atoms/landing-cta-button";
import { createSpaceSteps, LANDING_URLS } from "@/src/config/landing-content";

export function LandingCreateSpaceSection() {
  return (
    <section id="crie-seu-espaco" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="muziks-liquid-glass relative overflow-hidden rounded-3xl p-8 sm:p-12 md:p-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-60"
            aria-hidden
            style={{
              background:
                "radial-gradient(closest-side, rgba(0,102,178,0.45), transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <SectionHeading
                eyebrow="Crie o seu espaço"
                title="Abra o player e seja a fila de entrada do seu bar."
              />
              <p className="mt-6 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
                O <strong className="text-on-surface">player do Muziks</strong> roda
                no navegador — sem instalar nada. Conecte um telão, gere o QR
                Code da mesa e deixe o público escolher dentro das regras que
                você configurou.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LandingCtaButton
                  href={LANDING_URLS.player}
                  variant="primary"
                  external
                  showArrow
                >
                  Criar Player
                </LandingCtaButton>
                <LandingCtaButton href="/contato" variant="secondary">
                  Falar com a gente
                </LandingCtaButton>
              </div>

              <p className="mt-5 text-xs text-on-surface-variant/70">
                Funciona como PWA — não é preciso baixar app. É só ler o QR Code.
              </p>
            </div>

            <ul className="grid gap-3 text-sm text-on-surface-variant">
              {createSpaceSteps.map((s) => (
                <li
                  key={s.n}
                  className="muziks-glass flex items-start gap-4 rounded-2xl p-4"
                >
                  <span className="text-xs font-semibold tracking-[0.18em] text-primary">
                    {s.n}
                  </span>
                  <span className="text-on-surface-variant">{s.t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
