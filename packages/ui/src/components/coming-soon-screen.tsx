import type { ReactNode } from "react";
import { cn } from "@muziks/utils";
import { MuziksLogo } from "./muziks-logo";

export type ComingSoonScreenProps = {
  title: string;
  subtitle: string;
  children?: ReactNode;
  className?: string;
};

export function ComingSoonScreen({
  title,
  subtitle,
  children,
  className,
}: ComingSoonScreenProps) {
  return (
    <main
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]"
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-outline/80 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-glass md:p-10">
          <div className="flex justify-center">
            <MuziksLogo />
          </div>
          <h1 className="mt-8 text-center text-3xl font-semibold tracking-tight text-on-surface md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-center text-base leading-relaxed text-on-surface-variant md:text-lg">
            {subtitle}
          </p>
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </div>
    </main>
  );
}
