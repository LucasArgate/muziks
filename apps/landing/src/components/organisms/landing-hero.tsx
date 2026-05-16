import { cn } from "@muziks/utils";
import { landingVisibility } from "@/src/config/landing-visibility";
import { LeadCaptureForm } from "@/src/components/molecules/lead-capture-form";
import { TestimonialQuote } from "@/src/components/molecules/testimonial-quote";

export type LandingHeroProps = {
  title?: string;
  subtitle?: string;
};

const defaultTitle = "Perfeito para o seu bar";
const defaultSubtitle =
  "Ideal para criar playlists e música ambiente de acordo com o gosto de todos os seus clientes.";

const defaultQuote =
  "Como o Muziks, a solução ficou tão simples que, para quem chega no balcão pedindo para mexer no som, basta um “é só baixar nosso app!” e o problema está resolvido! Garante um pouco mais de paz para o bar e oportunidade para os clientes participarem democraticamente do que deve tocar.";

const formSlotHidden =
  "max-lg:hidden lg:invisible lg:pointer-events-none lg:select-none";

export function LandingHero({
  title = defaultTitle,
  subtitle = defaultSubtitle,
}: LandingHeroProps) {
  return (
    <section className="relative px-6 py-16 md:py-20" aria-labelledby="landing-hero-title">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <h1
            id="landing-hero-title"
            className="text-4xl font-semibold tracking-tight text-on-surface md:text-5xl"
          >
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant md:text-xl">
            {subtitle}
          </p>
          <TestimonialQuote
            className="mt-8"
            quote={defaultQuote}
            author="Douglas Marajoli"
            role="Gerente do bar Universitário Poco Loco"
          />
        </div>
        <div
          className={cn(!landingVisibility.leadForms && formSlotHidden)}
          aria-hidden={!landingVisibility.leadForms}
        >
          <LeadCaptureForm formId="hero-lead" ctaLabel="Quero o Muziks no meu bar" />
        </div>
      </div>
    </section>
  );
}
