import { cn } from "@muziks/utils";

const DEFAULT_REPO_URL = "https://github.com/LucasArgate/muziks";

export type GithubLinkProps = {
  href?: string;
  showLabel?: boolean;
  className?: string;
};

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function GithubLink({
  href = DEFAULT_REPO_URL,
  showLabel = false,
  className,
}: GithubLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] p-2.5 text-on-surface-variant transition-colors hover:border-white/20 hover:bg-white/[0.1] hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        showLabel && "px-3.5 py-2",
        className,
      )}
      aria-label="Código aberto no GitHub"
      title="Código aberto no GitHub"
    >
      <GithubIcon className="h-5 w-5 shrink-0" />
      {showLabel ? (
        <span className="text-sm font-medium">Código aberto</span>
      ) : null}
    </a>
  );
}
