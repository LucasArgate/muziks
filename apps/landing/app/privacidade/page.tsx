import Link from "next/link";
import { LegalPageTemplate } from "@/src/components/templates/legal-page-template";
import { createLandingMetadata } from "@/src/config/landing-metadata";
import { LANDING_URLS } from "@/src/config/landing-content";

export const dynamic = "force-static";

export const metadata = createLandingMetadata({
  title: "Política de privacidade",
  description:
    "Política de privacidade do Muziks: quais dados coletamos, por quê e como você pode exercer seus direitos (LGPD).",
  path: "/privacidade",
  keywords: ["privacidade", "LGPD", "dados pessoais"],
});

export default function PrivacidadePage() {
  const updated = new Date().toLocaleDateString("pt-BR");

  return (
    <LegalPageTemplate
      title="Política de privacidade"
      subtitle={`Última atualização: ${updated}`}
    >
      <div className="space-y-8 text-on-surface-variant">
        <section>
          <h2 className="text-xl font-semibold text-on-surface">1. Quem somos</h2>
          <p className="mt-3 leading-relaxed">
            O Muziks é um player democrático para bares e espaços. Esta
            política descreve como tratamos os dados pessoais coletados em{" "}
            <code className="text-on-surface">muziks.com.br</code>,{" "}
            <code className="text-on-surface">muziks.app</code> e{" "}
            <code className="text-on-surface">player.muziks.app</code>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">
            2. Dados que coletamos
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Identificação opcional do público</strong>: apelido e,
              quando informado, e-mail. Usado para creditar pedidos e votos
              na fila.
            </li>
            <li>
              <strong>Pedidos e votos</strong>: faixas escolhidas, espaço,
              horário. Necessário para operar a fila democrática.
            </li>
            <li>
              <strong>Dados técnicos</strong>: endereço IP, tipo de
              dispositivo, navegador e identificadores anônimos de sessão,
              usados para segurança e prevenção de abuso.
            </li>
            <li>
              <strong>Dados do espaço parceiro</strong>: nome do bar,
              contato responsável e política de curadoria configurada.
            </li>
          </ul>
          <p className="mt-3 leading-relaxed">
            <strong>Não coletamos</strong> dados sensíveis (saúde, opinião
            política, religião) nem dados de crianças.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">3. Para que usamos</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Operar a fila democrática e exibir o que está tocando.</li>
            <li>Aplicar a política de curadoria definida pelo espaço.</li>
            <li>Prevenir abuso (votos falsos, spam, ataques).</li>
            <li>Melhorar o produto com métricas agregadas e anonimizadas.</li>
            <li>Cumprir obrigações legais quando aplicável.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">4. Compartilhamento</h2>
          <p className="mt-3 leading-relaxed">
            Não vendemos dados. Compartilhamos apenas com prestadores
            técnicos necessários (hospedagem, autenticação, e-mail
            transacional) e quando exigido por lei. O espaço parceiro tem
            acesso aos pedidos e votos feitos no próprio bar.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">5. Retenção</h2>
          <p className="mt-3 leading-relaxed">
            Mantemos dados pelo tempo necessário à finalidade declarada. Logs
            técnicos são descartados em prazos curtos; histórico de pedidos
            e votos pode ser mantido para fins estatísticos de forma
            anonimizada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">6. Seus direitos (LGPD)</h2>
          <p className="mt-3 leading-relaxed">
            Você pode solicitar a qualquer momento: acesso, correção,
            exclusão, portabilidade ou anonimização dos seus dados, além de
            revogar consentimentos. Basta escrever para{" "}
            <a
              href={LANDING_URLS.email}
              className="text-on-surface underline-offset-4 hover:underline"
            >
              contato@muziks.com.br
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">7. Segurança</h2>
          <p className="mt-3 leading-relaxed">
            Aplicamos boas práticas (HTTPS, controle de acesso, monitoramento).
            Como o projeto é open source (
            <a
              href={LANDING_URLS.github}
              target="_blank"
              rel="noreferrer"
              className="text-on-surface underline-offset-4 hover:underline"
            >
              Apache 2.0
            </a>
            ), vulnerabilidades podem ser reportadas com responsabilidade
            via GitHub ou e-mail.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">
            8. Mudanças nesta política
          </h2>
          <p className="mt-3 leading-relaxed">
            Podemos atualizar esta política conforme o produto evolui. A
            versão vigente é sempre a publicada nesta página.
          </p>
          <p className="mt-3 text-sm text-on-surface-variant/80">
            Veja também os{" "}
            <Link href="/termos" className="text-on-surface underline-offset-4 hover:underline">
              Termos de uso
            </Link>
            .
          </p>
        </section>
      </div>
    </LegalPageTemplate>
  );
}
