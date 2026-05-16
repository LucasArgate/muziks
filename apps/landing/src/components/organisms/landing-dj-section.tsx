import Link from "next/link";
import { GlassPanel } from "@muziks/ui";
import { SectionHeading } from "@/src/components/atoms/section-heading";

export function LandingDjSection() {
  return (
    <section
      id="aplicativo"
      className="px-6 py-16 md:py-24"
      aria-labelledby="dj-section-title"
    >
      <div className="mx-auto max-w-3xl text-center">
        <SectionHeading
          title="Aqui você é o DJ"
          align="center"
          titleId="dj-section-title"
        />
        <p className="mt-6 text-base leading-relaxed text-on-surface-variant md:text-lg">
          Baixe agora o nosso app e escolha as músicas que tocam no bar onde você está.
        </p>
        <GlassPanel variant="functional" className="mx-auto mt-10 max-w-md p-8">
          <p className="text-sm text-on-surface-variant">
            O player colaborativo vive em{" "}
            <Link href="https://muziks.app" className="font-medium text-primary hover:underline">
              muziks.app
            </Link>
            — peça o link do seu espaço ou escaneie o QR na mesa.
          </p>
        </GlassPanel>
      </div>
    </section>
  );
}
