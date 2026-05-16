import { landingVisibility } from "@/src/config/landing-visibility";
import { SectionHeading } from "@/src/components/atoms/section-heading";
import { LeadCaptureForm } from "@/src/components/molecules/lead-capture-form";

export function LandingFeatureSection() {
  return (
    <section
      id="onde-voce-estiver"
      className="border-t border-white/10 bg-surface-container/40 px-6 py-16 md:py-20"
      aria-labelledby="feature-section-title"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <SectionHeading
            title="Onde você estiver"
            subtitle="A ordem das músicas é democrática"
            titleId="feature-section-title"
          />
          <p className="mt-6 text-base leading-relaxed text-on-surface-variant md:text-lg">
            O Muziks está presente nos melhores bares e está disponível para download gratuito.
          </p>
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">
            As músicas que a maioria pedir são enfileiradas primeiro — chame seus amigos para
            pedir com você e fazer sua música tocar mais rápido.
          </p>
          {landingVisibility.leadForms ? (
            <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-primary">
              Comece a usar agora
            </p>
          ) : null}
        </div>
        {landingVisibility.leadForms ? (
          <div>
            <LeadCaptureForm formId="feature-lead" ctaLabel="Quero o Muziks no meu bar" />
          </div>
        ) : (
          <div className="hidden lg:block" aria-hidden />
        )}
      </div>
    </section>
  );
}
