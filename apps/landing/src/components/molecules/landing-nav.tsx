import Link from "next/link";
import { cn } from "@muziks/utils";

export type LandingNavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type LandingNavProps = {
  items: LandingNavItem[];
  className?: string;
};

export function LandingNav({ items, className }: LandingNavProps) {
  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-x-6 gap-y-2", className)} aria-label="Principal">
      {items.map((item) =>
        item.external ? (
          <a
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
