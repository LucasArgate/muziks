import Link from "next/link";
import { LegalPageTemplate } from "@/src/components/templates/legal-page-template";
import { createLandingMetadata } from "@/src/config/landing-metadata";
import { LANDING_URLS } from "@/src/config/landing-content";

export const dynamic = "force-static";

export const metadata = createLandingMetadata({
  title: "Termos de uso",
  description:
    "Termos de uso do Muziks: player democrático para bares e espaços. Software open source sob Apache 2.0.",
  path: "/termos",
  keywords: ["termos de uso", "Apache 2.0", "licença open source"],
});

export default function TermosPage() {
  const updated = new Date().toLocaleDateString("pt-BR");

  return (
    <LegalPageTemplate
      title="Termos de uso"
      subtitle={`Última atualização: ${updated}`}
    >
      <div className="space-y-8 text-on-surface-variant">
        <section>
          <h2 className="text-xl font-semibold text-on-surface">1. Sobre o Muziks</h2>
          <p className="mt-3 leading-relaxed">
            O <strong>Muziks</strong> é um player democrático para bares e
            espaços coletivos, onde o público sugere e vota nas músicas da
            fila dentro de regras definidas pelo dono do espaço. O serviço
            é entregue como PWA (Progressive Web App) — não é necessário
            instalar nenhum aplicativo nativo.
          </p>
          <p className="mt-3 leading-relaxed">
            Ao usar o Muziks (incluindo o app público em{" "}
            <code className="text-on-surface">muziks.app</code> e o player em{" "}
            <code className="text-on-surface">player.muziks.app</code>), você concorda com estes Termos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">
            2. Licença do software (Apache 2.0)
          </h2>
          <p className="mt-3 leading-relaxed">
            O código-fonte do Muziks é open source e está disponível em{" "}
            <a
              href={LANDING_URLS.github}
              target="_blank"
              rel="noreferrer"
              className="text-on-surface underline-offset-4 hover:underline"
            >
              github.com/LucasArgate/muziks
            </a>
            , publicado sob a{" "}
            <a
              href={LANDING_URLS.license}
              target="_blank"
              rel="noreferrer"
              className="text-on-surface underline-offset-4 hover:underline"
            >
              Apache License 2.0
            </a>
            .
          </p>
          <p className="mt-3 leading-relaxed">
            Você pode usar, copiar, modificar e distribuir o código conforme
            os termos da Apache 2.0, mantendo o aviso de copyright e de
            licença. O software é fornecido <em>“no estado em que se
            encontra”</em>, sem garantias de qualquer tipo.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">
            3. Fronteiras do produto
          </h2>
          <p className="mt-3 leading-relaxed">
            O Muziks é uma camada de <strong>curadoria coletiva</strong> — ele
            organiza pedidos e votos. Ele <strong>não substitui</strong> a
            responsabilidade do espaço sobre o conteúdo reproduzido,
            direitos autorais (ECAD e equivalentes) e adequação ao público.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              O Muziks <strong>não é uma plataforma de streaming musical</strong>.
              A reprodução pública das faixas é responsabilidade do espaço,
              via integração com o serviço escolhido.
            </li>
            <li>
              A <strong>política de curadoria</strong> (gêneros, artistas,
              horários) é configurada pelo dono do espaço. O Muziks apenas
              executa as regras definidas.
            </li>
            <li>
              Pedidos e votos do público são <strong>sugestões dentro de
              regras</strong>, não direitos garantidos de execução.
            </li>
            <li>
              Durante o beta fechado, o serviço pode ficar indisponível,
              sofrer mudanças de comportamento ou ter dados reiniciados sem
              aviso prévio.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">4. Uso aceitável</h2>
          <p className="mt-3 leading-relaxed">Você concorda em não usar o Muziks para:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              Enviar conteúdo ilegal, discriminatório, com discurso de ódio
              ou que incite violência.
            </li>
            <li>
              Tentar burlar a política de curadoria do espaço, manipular
              votos ou prejudicar outros usuários.
            </li>
            <li>
              Atacar a infraestrutura (engenharia reversa de chaves, DoS,
              exploração de vulnerabilidades sem reporte responsável).
            </li>
            <li>
              Reutilizar a marca <strong>“Muziks”</strong> em produtos
              derivados sem autorização.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">
            5. Disponibilidade e mudanças
          </h2>
          <p className="mt-3 leading-relaxed">
            O Muziks está em desenvolvimento ativo. Funcionalidades podem
            ser adicionadas, alteradas ou removidas. Podemos atualizar estes
            Termos a qualquer momento — a versão vigente é sempre a publicada
            nesta página.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">
            6. Limitação de responsabilidade
          </h2>
          <p className="mt-3 leading-relaxed">
            Nos limites permitidos por lei e em consonância com a Apache 2.0,
            o Muziks e seus autores não respondem por danos indiretos,
            incidentais ou consequentes decorrentes do uso (ou impossibilidade
            de uso) do serviço.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-on-surface">7. Contato</h2>
          <p className="mt-3 leading-relaxed">
            Dúvidas sobre estes Termos:{" "}
            <a
              href={LANDING_URLS.email}
              className="text-on-surface underline-offset-4 hover:underline"
            >
              contato@muziks.com.br
            </a>
            .
          </p>
          <p className="mt-3 text-sm text-on-surface-variant/80">
            Veja também a{" "}
            <Link href="/privacidade" className="text-on-surface underline-offset-4 hover:underline">
              Política de privacidade
            </Link>
            .
          </p>
        </section>
      </div>
    </LegalPageTemplate>
  );
}
