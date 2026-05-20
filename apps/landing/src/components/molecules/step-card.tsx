import { cn } from "@muziks/utils";

export type StepCardProps = {
  number?: string;
  title: string;
  body: string;
  className?: string;
};

export function StepCard({ number, title, body, className }: StepCardProps) {
  return (
    <div
      className={cn(
        "muziks-glass rounded-2xl p-7 transition hover:bg-white/10",
        className,
      )}
    >
      {number ? (
        <span className="text-xs font-semibold tracking-[0.2em] text-primary">
          {number}
        </span>
      ) : null}
      <h3 className={cn("text-lg font-semibold text-on-surface", number && "mt-4")}>
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{body}</p>
    </div>
  );
}
