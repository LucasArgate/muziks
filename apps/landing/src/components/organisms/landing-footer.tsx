import { MuziksLogo } from "@muziks/ui";
import { GithubLink } from "@/src/components/molecules/github-link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
        <MuziksLogo className="h-8 opacity-90" />
        <GithubLink showLabel />
        <p className="text-sm font-medium text-on-surface-variant">Nós amamos músicas</p>
        <p className="text-xs text-on-surface-variant/70">
          © {new Date().getFullYear()} Muziks. Música compartilhada com regras claras.
        </p>
      </div>
    </footer>
  );
}
