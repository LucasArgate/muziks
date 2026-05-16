/**
 * Liga/desliga blocos da landing antes de estarem prontos em produção.
 * `true` = visível; `false` = `invisible` (mantém o espaço no layout).
 */
export const landingVisibility = {
  /** Menu: Aplicativo, Bares, Planos, Blog, Contato */
  nav: false,
  /** Formulários de lead (e-mail) — backend ainda não envia */
  leadForms: false,
} as const;

export type LandingVisibility = typeof landingVisibility;
