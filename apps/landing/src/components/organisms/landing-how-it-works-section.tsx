import { SectionHeading } from "@/src/components/atoms/section-heading";
import { StepCard } from "@/src/components/molecules/step-card";
import { howItWorksSteps } from "@/src/config/landing-content";

export function LandingHowItWorksSection() {
  return (
    <section id="como-funciona" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Como funciona"
          title="Da mesa pro alto-falante em três passos."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {howItWorksSteps.map((s) => (
            <StepCard key={s.n} number={s.n} title={s.title} body={s.body} />
          ))}
        </div>
      </div>
    </section>
  );
}
