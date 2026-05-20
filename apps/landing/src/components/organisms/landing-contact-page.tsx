import Link from "next/link";
import { LegalPageTemplate } from "@/src/components/templates/legal-page-template";
import { LANDING_URLS } from "@/src/config/landing-content";

const contactCards = [
  {
    eyebrow: "E-mail",
    title: "contato@muziks.com.br",
    body: "Melhor caminho para parcerias e onboarding de novos espaços.",
    href: LANDING_URLS.emailBar,
  },
  {
    eyebrow: "GitHub",
    title: "LucasArgate/muziks",
    body: "Bugs, ideias e contribuições técnicas — abra uma issue.",
    href: LANDING_URLS.github,
    external: true,
  },
  {
    eyebrow: "Player",
    title: "player.muziks.app",
    body: "Abra direto no navegador — é a fila de entrada do seu espaço.",
    href: LANDING_URLS.player,
    external: true,
  },
  {
    eyebrow: "App do público",
    title: "muziks.app",
    body: "PWA — sem instalar. É só ler o QR Code da mesa.",
    href: LANDING_URLS.app,
    external: true,
  },
] as const;

export function LandingContactPage() {
  return (
    <LegalPageTemplate
      title="Vamos conversar."
      showSpotlight
    >
      <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
        O Muziks está em beta fechado em alguns bares parceiros. Se você
        quer testar o player no seu espaço, propor uma parceria ou só falar
        de música — manda mensagem.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {contactCards.map((card) => (
          <a
            key={card.eyebrow}
            href={card.href}
            target={"external" in card && card.external ? "_blank" : undefined}
            rel={"external" in card && card.external ? "noreferrer" : undefined}
            className="muziks-liquid-glass block rounded-2xl p-6 transition hover:bg-white/[0.07]"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {card.eyebrow}
            </span>
            <p className="mt-3 text-lg font-semibold text-on-surface">{card.title}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{card.body}</p>
          </a>
        ))}
      </div>

      <div className="mt-12 border-t border-white/10 pt-8 text-sm text-on-surface-variant">
        <p>
          Veja também:{" "}
          <Link href="/termos" className="text-on-surface underline-offset-4 hover:underline">
            Termos de uso
          </Link>{" "}
          ·{" "}
          <Link href="/privacidade" className="text-on-surface underline-offset-4 hover:underline">
            Política de privacidade
          </Link>
        </p>
      </div>
    </LegalPageTemplate>
  );
}
