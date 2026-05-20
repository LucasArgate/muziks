import { LandingCtaButton } from "@/src/components/atoms/landing-cta-button";
import { closedBetaStatus, LANDING_URLS } from "@/src/config/landing-content";

export function LandingClosedBetaSection() {
  return (
    <section className="relative px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="muziks-glass rounded-3xl p-8 sm:p-10 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />
                Beta fechado
              </span>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-on-surface md:text-3xl">
                O Muziks está rodando hoje só em alguns bares parceiros.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
                Estamos validando a fila democrática, o firewall de curadoria e a
                experiência de telão antes de abrir o cadastro geral. Quer ser
                um dos próximos espaços a entrar? Fale com a gente.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <LandingCtaButton href="/contato" variant="white" showArrow>
                Quero o Muziks no meu bar
              </LandingCtaButton>
              <LandingCtaButton href={LANDING_URLS.github} variant="secondary" external>
                Acompanhar no GitHub
              </LandingCtaButton>
            </div>
          </div>

          <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-xs text-on-surface-variant sm:grid-cols-3">
            {closedBetaStatus.map((item) => (
              <span key={item.label}>
                <strong className="text-on-surface-variant">{item.label}</strong>{" "}
                {item.value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
