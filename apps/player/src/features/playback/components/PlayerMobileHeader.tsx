"use client";

import { Menu } from "lucide-react";

import { Button } from "@/src/components/ui/button";

type PlayerMobileHeaderProps = {
  slug: string;
  navOpen: boolean;
  onOpenNav: () => void;
};

export function PlayerMobileHeader({
  slug,
  navOpen,
  onOpenNav,
}: PlayerMobileHeaderProps) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-outline/30 px-4 py-3 md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onOpenNav}
        className="shrink-0"
        aria-label="Abrir menu"
        aria-expanded={navOpen}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          Muziks Player
        </p>
        <p className="truncate text-lg font-semibold text-on-surface">{slug}</p>
      </div>
    </header>
  );
}
