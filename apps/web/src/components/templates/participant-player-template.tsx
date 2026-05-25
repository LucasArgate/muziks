import type { ReactNode } from "react";

import { AmbientSpotlight, MuziksLogo } from "@muziks/ui";
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
    <AmbientSpotlight
      opacity={0.4}
      className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 py-6"
    >
      <header className="relative z-10 flex items-center justify-between gap-3">
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
      <div className="relative z-10 flex flex-col gap-4">{children}</div>
    </AmbientSpotlight>
  );
}
