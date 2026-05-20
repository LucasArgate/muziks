import Link from "next/link";
import { MuziksWordmark } from "@/src/components/atoms/muziks-wordmark";
import { LANDING_URLS } from "@/src/config/landing-content";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-6 pb-12 pt-14">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <MuziksWordmark size="footer" />
          <p className="mt-4 max-w-sm text-sm text-on-surface-variant">
            Muziks — música compartilhada com regras claras. Player democrático
            para bares e espaços.
          </p>
          <a
            href={LANDING_URLS.email}
            className="mt-4 inline-block text-sm text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline"
          >
            contato@muziks.com.br
          </a>
        </div>

        <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant/70">
            Produto
          </span>
          <a href="#como-funciona" className="hover:text-on-surface">
            Como funciona
          </a>
          <a href="#para-bares" className="hover:text-on-surface">
            Para bares
          </a>
          <a href="#crie-seu-espaco" className="hover:text-on-surface">
            Crie o seu espaço
          </a>
          <a
            href={LANDING_URLS.player}
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface"
          >
            Player
          </a>
          <a
            href={LANDING_URLS.app}
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface"
          >
            Abrir App
          </a>
        </div>

        <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant/70">
            Projeto
          </span>
          <a
            href={LANDING_URLS.github}
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface"
          >
            GitHub
          </a>
          <a
            href={LANDING_URLS.manifesto}
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface"
          >
            Manifesto
          </a>
          <a
            href={LANDING_URLS.design}
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface"
          >
            Design system
          </a>
          <a
            href={LANDING_URLS.license}
            target="_blank"
            rel="noreferrer"
            className="hover:text-on-surface"
          >
            Licença (Apache 2.0)
          </a>
        </div>

        <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
          <span className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant/70">
            Legal & Contato
          </span>
          <Link href="/contato" className="hover:text-on-surface">
            Contato
          </Link>
          <Link href="/termos" className="hover:text-on-surface">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="hover:text-on-surface">
            Privacidade
          </Link>
          <a href={LANDING_URLS.email} className="hover:text-on-surface">
            E-mail
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between border-t border-white/5 pt-6 text-xs text-on-surface-variant/70">
        <span>© {new Date().getFullYear()} Muziks</span>
        <span>Política antes do volume.</span>
      </div>
    </footer>
  );
}
