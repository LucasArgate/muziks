import Image from "next/image";
import {
  avatarStackGradients,
  LANDING_ASSETS,
  nowPlayingDemo,
} from "@/src/config/landing-content";

export function NowPlayingCard() {
  const { venue, title, artist, elapsed, duration, progressPercent, votersLabel } =
    nowPlayingDemo;

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="absolute inset-0 -z-10 rounded-[2rem] opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,102,178,0.25), transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="muziks-liquid-glass p-6 sm:p-7">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-variant">
          <span className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Tocando agora
          </span>
          <span>{venue}</span>
        </div>

        <div className="relative mt-5 flex aspect-square items-center justify-center">
          <div className="muziks-spin-slow relative h-full w-full overflow-hidden rounded-full border border-white/10">
            <Image
              src={LANDING_ASSETS.heroArtwork}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/40" />
            <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/70" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-lg font-semibold leading-tight text-on-surface">{title}</p>
          <p className="text-sm text-on-surface-variant">{artist}</p>
        </div>

        <div className="mt-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3aa0ff] to-primary"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-on-surface-variant">
            <span>{elapsed}</span>
            <span>{duration}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {avatarStackGradients.map((bg, i) => (
                <span
                  key={i}
                  className="inline-block h-7 w-7 rounded-full border-2 border-surface-container"
                  style={{ background: bg }}
                />
              ))}
            </div>
            <span className="text-xs text-on-surface-variant">{votersLabel}</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-semibold text-on-surface transition hover:bg-primary"
          >
            <span className="text-base leading-none">+</span> Votar
          </button>
        </div>
      </div>
    </div>
  );
}
