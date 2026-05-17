import { GlassPanel } from "@muziks/ui";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <GlassPanel className="p-8 md:p-10">
          <h1 className="text-center text-2xl font-semibold text-on-surface md:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-on-surface-variant">
            {subtitle}
          </p>
          <div className="mt-8 space-y-4">{children}</div>
        </GlassPanel>
      </div>
    </main>
  );
}
