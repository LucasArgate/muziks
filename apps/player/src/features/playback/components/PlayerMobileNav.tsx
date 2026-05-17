"use client";

import type { ProfileSummary } from "@muziks/types";
import { cn } from "@muziks/utils";
import Link from "next/link";

import { OwnerProfileBlock } from "@/src/components/molecules/owner-profile-block";
import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/src/components/ui/sheet";

import { getPlayerNavItems, type PlayerNavSection } from "./player-nav-items";

type PlayerMobileNavProps = {
  open: boolean;
  slug: string;
  profile: ProfileSummary | null;
  activeNav: PlayerNavSection;
  onClose: () => void;
};

export function PlayerMobileNav({
  open,
  slug,
  profile,
  activeNav,
  onClose,
}: PlayerMobileNavProps) {
  const navItems = getPlayerNavItems(slug, activeNav);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="left"
        className="flex w-72 flex-col border-outline/40 bg-surface p-0 md:hidden"
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SheetDescription className="sr-only">
          Navegação do player {slug}
        </SheetDescription>

        <div className="border-b border-outline/40 px-5 py-5">
          <OwnerProfileBlock profile={profile} className="mb-4" />
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Muziks Player
          </p>
          <p className="mt-1 truncate text-lg font-semibold text-on-surface">
            {slug}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              disabled={item.disabled}
              className={cn(
                "h-auto w-full justify-start rounded-lg px-3 py-2 text-sm font-medium",
                item.active
                  ? "bg-surface-container-high text-on-surface hover:bg-surface-container-high"
                  : "text-on-surface-variant",
              )}
              asChild={!item.disabled}
              onClick={item.disabled ? undefined : onClose}
            >
              {item.disabled ? (
                <span>
                  {item.label}
                  <span className="ml-2 text-[10px] uppercase">em breve</span>
                </span>
              ) : (
                <Link href={item.href}>{item.label}</Link>
              )}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
