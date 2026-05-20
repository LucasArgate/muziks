import { SectionHeading } from "@/src/components/atoms/section-heading";
import { forBarsFeatures } from "@/src/config/landing-content";

export function LandingForBarsSection() {
  return (
    <section
      id="para-bares"
      className="relative border-t border-white/5 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
          <SectionHeading
            eyebrow="Para bares e espaços"
            title="Engajamento sem perder o som da casa."
          />
          <p className="text-base leading-relaxed text-on-surface-variant">
            Como um firewall: o que pode entrar, você decide. O Muziks transforma
            “quem mexe no som?” em participação democrática — com política
            antes do volume.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {forBarsFeatures.map((f) => (
            <div
              key={f.title}
              className="muziks-glass rounded-2xl p-7 transition hover:bg-white/[0.07]"
            >
              <h3 className="text-lg font-semibold text-on-surface">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
