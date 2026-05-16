/**
 * Liga/desliga blocos da landing antes de estarem prontos em produção.
 * `true` = visível; `false` = oculto (no desktop mantém coluna vazia no grid).
 */
export const landingVisibility = {
  /** Menu: Aplicativo, Bares, Planos, Blog, Contato */
  nav: false,
  /** Formulários de lead (e-mail) — backend ainda não envia */
  leadForms: false,
} as const;

export type LandingVisibility = typeof landingVisibility;
