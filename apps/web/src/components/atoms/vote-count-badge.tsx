import { cn } from "@muziks/utils";

type VoteCountBadgeProps = {
  votes: number;
  className?: string;
};

export function VoteCountBadge({ votes, className }: VoteCountBadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full bg-outline/20 px-2 py-0.5 text-xs font-medium text-on-surface-variant",
        className,
      )}
    >
      {votes} {votes === 1 ? "voto" : "votos"}
    </span>
  );
}
