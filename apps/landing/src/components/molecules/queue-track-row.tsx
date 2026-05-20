export type QueueTrackRowProps = {
  index: number;
  title: string;
  artist: string;
  votes: number;
  mine?: boolean;
};

export function QueueTrackRow({
  index,
  title,
  artist,
  votes,
  mine = false,
}: QueueTrackRowProps) {
  const hue = (index * 67) % 360;

  return (
    <li
      className={`flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-white/5 ${
        mine ? "bg-primary/10" : ""
      }`}
    >
      <span className="w-5 text-center text-sm tabular-nums text-on-surface-variant/80">
        {index + 1}
      </span>
      <span
        className="h-11 w-11 shrink-0 rounded-full border border-white/10"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 70% 45%), hsl(${(hue + 80) % 360} 60% 25%))`,
        }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-surface">{title}</p>
        <p className="truncate text-xs text-on-surface-variant">{artist}</p>
      </div>
      <div className="hidden -space-x-1.5 sm:flex">
        {Array.from({ length: Math.min(3, Math.ceil(votes / 8)) }).map((_, j) => (
          <span
            key={j}
            className="inline-block h-5 w-5 rounded-full border-2 border-surface-container"
            style={{
              background: `hsl(${(index * 47 + j * 80) % 360} 65% 55%)`,
            }}
          />
        ))}
      </div>
      <span className="w-10 text-right text-sm font-semibold tabular-nums text-on-surface">
        {votes}
      </span>
      <button
        type="button"
        aria-label="Votar nesta música"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-base font-semibold text-on-surface transition hover:bg-primary"
      >
        +
      </button>
    </li>
  );
}
