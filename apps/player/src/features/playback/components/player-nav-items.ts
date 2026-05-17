export type PlayerNavSection = "home" | "queue" | "settings";

export type PlayerNavItem = {
  label: string;
  href: string;
  active: boolean;
  disabled: boolean;
};

export function getPlayerNavItems(
  slug: string,
  active: PlayerNavSection,
): PlayerNavItem[] {
  return [
    {
      label: "Início",
      href: `/${slug}`,
      active: active === "home",
      disabled: false,
    },
    {
      label: "Fila",
      href: `/${slug}/queue`,
      active: active === "queue",
      disabled: false,
    },
    {
      label: "Configurações",
      href: `/${slug}/settings`,
      active: active === "settings",
      disabled: false,
    },
  ];
}
