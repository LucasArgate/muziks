import Link from "next/link";
import type { ReactNode } from "react";

export type LegalPageTemplateProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showSpotlight?: boolean;
};

export function LegalPageTemplate({
  title,
  subtitle,
  children,
  showSpotlight = false,
}: LegalPageTemplateProps) {
  return (
    <main className="relative min-h-dvh bg-surface px-6 pb-24 pt-32 text-on-surface">
      {showSpotlight ? (
        <div className="muziks-spotlight absolute inset-0 -z-10 opacity-60" />
      ) : null}
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface"
        >
          ← Voltar
        </Link>

        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-on-surface md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-sm text-on-surface-variant/80">{subtitle}</p>
        ) : null}

        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
