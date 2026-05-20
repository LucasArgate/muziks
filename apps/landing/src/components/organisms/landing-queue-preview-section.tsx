import { SectionHeading } from "@/src/components/atoms/section-heading";
import { QueueTrackRow } from "@/src/components/molecules/queue-track-row";
import {
  queuePreviewBullets,
  queuePreviewTracks,
} from "@/src/config/landing-content";

export function LandingQueuePreviewSection() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <SectionHeading
            eyebrow="Fila democrática"
            title="A próxima música é decidida por quem está no bar."
          />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
            Cada voto sobe a posição no ranking — sempre dentro do que o dono
            do espaço liberou. Sem brigar com o DJ fantasma, sem fila opaca,
            sem “quem chegou primeiro”.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-on-surface-variant">
            {queuePreviewBullets.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="muziks-glass rounded-3xl p-3 sm:p-4">
          <div className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-[0.18em] text-on-surface-variant/80">
            <span>Próximas na fila</span>
            <span>Votos</span>
          </div>
          <ul className="divide-y divide-white/5">
            {queuePreviewTracks.map((t, i) => (
              <QueueTrackRow
                key={t.title}
                index={i}
                title={t.title}
                artist={t.artist}
                votes={t.votes}
                mine={"mine" in t ? t.mine : false}
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
