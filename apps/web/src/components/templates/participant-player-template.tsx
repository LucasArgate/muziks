import type { ReactNode } from "react";

import { MuziksLogo } from "@muziks/ui";
import Link from "next/link";

type ParticipantPlayerTemplateProps = {
  slug: string;
  displayName: string;
  children: ReactNode;
};

export function ParticipantPlayerTemplate({
  slug,
  displayName,
  children,
}: ParticipantPlayerTemplateProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between gap-3">
        <Link href="/" className="shrink-0">
          <MuziksLogo className="h-7 w-auto opacity-90" />
        </Link>
        <div className="min-w-0 text-right">
          <p className="truncate text-sm font-medium text-on-surface">
            {displayName}
          </p>
          <p className="truncate text-xs text-on-surface-variant">@{slug}</p>
        </div>
      </header>
      {children}
    </div>
  );
}
