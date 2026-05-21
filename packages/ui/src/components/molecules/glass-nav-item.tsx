import {
  cloneElement,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@muziks/utils";

import { glassHoverClass, glassSurfaceClass } from "../../glass/glass-surface";

export type GlassNavItemProps = {
  active?: boolean;
  disabled?: boolean;
  href?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Merge nav styles onto a single child (e.g. Next.js Link). */
  asChild?: boolean;
};

const itemBaseClass =
  "flex h-auto w-full items-center justify-start rounded-lg px-3 py-2 text-sm font-medium";

export function glassNavItemClass(
  active = false,
  disabled = false,
  className?: string,
): string {
  const stateClass = disabled
    ? "cursor-not-allowed text-on-surface-variant opacity-60"
    : active
      ? cn(
          glassSurfaceClass({ variant: "functional", radius: "default" }),
          "text-on-surface",
        )
      : cn("text-on-surface-variant", glassHoverClass, "hover:bg-white/10");

  return cn(itemBaseClass, stateClass, className);
}

export function GlassNavItem({
  active = false,
  disabled = false,
  href,
  children,
  className,
  onClick,
  asChild = false,
}: GlassNavItemProps) {
  const classNames = glassNavItemClass(active, disabled, className);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: cn(
        classNames,
        (children as ReactElement<{ className?: string }>).props.className,
      ),
    });
  }

  if (disabled || !href) {
    const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
      type: "button",
      disabled,
      className: classNames,
      onClick: disabled ? undefined : onClick,
    };
    return <button {...buttonProps}>{children}</button>;
  }

  const linkProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
    href,
    className: classNames,
    onClick,
  };
  return <a {...linkProps}>{children}</a>;
}
