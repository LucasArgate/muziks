"use client";

import type { ProfileSummary } from "@muziks/types";
import { cn } from "@muziks/utils";
import Link from "next/link";

import { GlassNavItem, MuziksLogo, glassSurfaceClass } from "@muziks/ui";

import { OwnerProfileBlock } from "@/src/components/molecules/owner-profile-block";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/src/components/ui/sheet";

import {
  getPlayerNavItems,
  type PlayerNavSection,
} from "@/src/lib/player-nav-items";

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
        className={cn(
          "flex w-72 flex-col border-outline/40 p-0 md:hidden",
          glassSurfaceClass({ variant: "functional", radius: "default" }),
        )}
      >
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <SheetDescription className="sr-only">
          Navegação do player {slug}
        </SheetDescription>

        <div className="border-b border-outline/40 px-5 py-5">
          <MuziksLogo variant="light" className="mb-4 h-4 w-auto opacity-90" />
          <OwnerProfileBlock profile={profile} />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <GlassNavItem
              key={item.label}
              active={item.active}
              disabled={item.disabled}
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
            </GlassNavItem>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
