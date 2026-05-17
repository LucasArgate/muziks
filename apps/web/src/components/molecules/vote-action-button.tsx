import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type VoteActionButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export function VoteActionButton({
  onClick,
  disabled = false,
  className,
}: VoteActionButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className={cn(
        "h-9 w-9 shrink-0 rounded-full border-primary/40 text-primary hover:bg-primary/10",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label="Votar nesta faixa"
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
}
