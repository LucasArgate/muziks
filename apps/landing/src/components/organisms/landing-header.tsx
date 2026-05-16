import Link from "next/link";
import { MuziksLogo } from "@muziks/ui";
import { GithubLink } from "@/src/components/molecules/github-link";
import { LandingNav, type LandingNavItem } from "@/src/components/molecules/landing-nav";

const defaultNavItems: LandingNavItem[] = [
  { label: "Aplicativo", href: "/#aplicativo" },
  { label: "Bares", href: "/bares" },
  { label: "Planos", href: "/planos" },
  { label: "Blog", href: "https://blog.muziks.com.br", external: true },
  { label: "Contato", href: "/contato" },
];

export type LandingHeaderProps = {
  navItems?: LandingNavItem[];
};

export function LandingHeader({ navItems = defaultNavItems }: LandingHeaderProps) {
  return (
    <header className="relative z-20 border-b border-white/10 bg-surface/80 backdrop-blur-glass">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-5 md:flex-row md:justify-between">
        <Link href="/" className="shrink-0">
          <MuziksLogo />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
          <LandingNav items={navItems} />
          <GithubLink />
        </div>
      </div>
    </header>
  );
}
