# Visão e escopo

## Visão

O Muziks é um **player democrático e geoposicionado**: o público pode **influenciar a fila** (escolhendo dentro das regras ou **votando** em faixas já elegíveis), enquanto o **dono do player** define **políticas claras** — por gênero, artista, música, dia da semana e, opcionalmente, **fichas** para votar. A promessa está no [Manifesto](../MANIFESTO.md): democracia com política, não anarquia.

## Objetivos de negócio (fase inicial)

1. **Validar tração** com entrega rápida via **PWA** (instalação opcional, uso mobile-first).
2. **Reduzir atrito** entre “abrir o som ao público” e “manter identidade do espaço” — o dono não microgerencia cada pedido se a política estiver bem calibrada.
3. **Engajar o público** com votação transparente na fila, sem confundir **participação paga (fichas)** com **licenciamento de obra** (fora do escopo de “vender a música” no produto).

## Mapeamento manifesto → specs

Contexto de campo e inferências que antecedem o manifesto (histórias, design thinking): [design-thinking-evidence-and-inferences.md](../design-thinking-evidence-and-inferences.md).

| Princípio (manifesto) | Onde detalhar |
|----------------------|---------------|
| Dono manda na política | [04-rules-firewall.md](04-rules-firewall.md), [03-domain-model.md](03-domain-model.md) |
| Firewall gênero → artista → música | [04-rules-firewall.md](04-rules-firewall.md) |
| Cortesia quando negado | [07-ux-copy-and-states.md](07-ux-copy-and-states.md) |
| Dia da semana | [04-rules-firewall.md](04-rules-firewall.md) |
| GPS, nome, link, QR | [05-discovery-and-access.md](05-discovery-and-access.md) |
| Votos no ranking | [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md) |
| Fichas no voto | [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md) |
| Privacidade e abuso | [05-discovery-and-access.md](05-discovery-and-access.md), [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md) |
| Telão / tela pública (opcional) | [12-telao-display-publico.md](12-telao-display-publico.md); [05-discovery-and-access.md](05-discovery-and-access.md) (QR); [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md) (foto, consentimento) |

## MVP (produto mínimo viável)

Definição: o menor conjunto que demonstra **“público participa; espaço manda na política”** em um fluxo real.

**Incluído no MVP (comportamento desejado):**

- Um **player** identificável (conceito mínimo: nome/slug ou ID estável exposto na UI).
- **Política** aplicável à escolha de faixas: pelo menos **uma dimensão** de bloqueio/liberação (ex.: lista permitida/negra ou regra simplificada) com caminho de evolução para o modelo completo gênero → artista → música (ver [04-rules-firewall.md](04-rules-firewall.md)).
- **Fila** visível com ordem influenciada por **votos** em itens já na fila ou já elegíveis para voto (semântica em [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).
- **Participação do público** via pelo menos **um** modo de descoberta: **link compartilhável** (QR é variação do mesmo deep link). **GPS + raio** e **nome único** podem entrar no MVP ou imediatamente após, conforme decisão em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md) — até lá, tratam-se como requisitos de produto já especificados, não como “opcionais de visão”.
- **Feedback amigável** quando uma ação não é permitida (copy e estados em [07-ux-copy-and-states.md](07-ux-copy-and-states.md)).
- **PWA** instalável com shell utilizável offline quando fizer sentido tecnicamente ([10-pwa-strategy.md](10-pwa-strategy.md)).

**Alto valor, pode entrar logo após o núcleo (tração):**

- **Modo telão / tela pública** — ver [12-telao-display-publico.md](12-telao-display-publico.md): representação visual no espaço (fila, escolhas, fotos com consentimento), **QR** para entrada em massa, habilitação por contexto (ex.: bares universitários, eventos). Histórico de pesquisa de empatia (design thinking) na aceleração apontou o telão como peça central de aderência e expansão orgânica.

**Fora do escopo inicial (explícito):**

- Resolver **licenciamento de execução pública** ou integração comercial completa com provedores de streaming — o produto **não** vende música; fichas pagam **mecanismo de voto/participação** ([Manifesto](../MANIFESTO.md)).
- **Anti-fraude enterprise** (nível bancário); no MVP basta consciência de risco e hooks especificados em [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md) e [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md).
- **Moderação de comunidade** avançada (denúncias, tribunais) além de revogação de link e ajuste de política pelo dono.

## Premissas

- O **dono do player** é o responsável legal/operacional pelo ambiente físico e pelo volume; o Muziks fornece **ferramentas de política e UX**, não substitui compliance local.
- Haverá **backend ou serviços** para estado compartilhado (fila, votos, política); o detalhe é aberto em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md).

## Não-objetivos (para evitar escopo oculto)

- Ser um **app de música genérico** sem política por espaço.
- Ser apenas **votação** sem fila/reprodução contextualizada ao player.
- Conflitar com o manifesto: **humilhar** o usuário por pedido negado ou **misturar** receita de ficha com “compra de faixa”.

## Critérios de sucesso do MVP

- Dono consegue **publicar** um player e **restringir** o que entra na experiência de escolha.
- Participante consegue **entrar**, **entender** por que algo foi bloqueado e **votar** quando aplicável.
- Documentação em `docs/specs/` permanece **fonte única** para perguntas “o produto faz X?” durante implementação.
