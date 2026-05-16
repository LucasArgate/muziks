import { cn } from "@muziks/utils";
import { landingVisibility } from "@/src/config/landing-visibility";
import { SectionHeading } from "@/src/components/atoms/section-heading";
import { LeadCaptureForm } from "@/src/components/molecules/lead-capture-form";

const formSlotHidden =
  "max-lg:hidden lg:invisible lg:pointer-events-none lg:select-none";

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
          <p
            className={cn(
              "mt-8 text-sm font-semibold uppercase tracking-widest text-primary",
              !landingVisibility.leadForms &&
                "max-lg:hidden lg:invisible lg:pointer-events-none lg:select-none",
            )}
            aria-hidden={!landingVisibility.leadForms}
          >
            Comece a usar agora
          </p>
        </div>
        <div
          className={cn(!landingVisibility.leadForms && formSlotHidden)}
          aria-hidden={!landingVisibility.leadForms}
        >
          <LeadCaptureForm formId="feature-lead" ctaLabel="Quero o Muziks no meu bar" />
        </div>
      </div>
    </section>
  );
}
