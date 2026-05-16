# Fila, votação e fichas

## Fila

A **fila** é a lista ordenada de faixas **aceitas** pelo player para execução futura ou em andamento.

**Requisitos:**

- A ordem deve refletir **prioridade** influenciada por **votos** em itens elegíveis, sem violar política do dono ([04-rules-firewall.md](04-rules-firewall.md)).
- O dono pode ter **controles** que a implementação deve prever: pausar votação, reordenar manualmente, remover item — comportamento exato pode ser “fase 2”, mas a spec assume que **voto é subserviente ao dono**.

## Votação

**Definição:** um voto é um incremento de preferência coletiva sobre um **QueueItem** (ou faixa na fila) que **já é elegível** para receber votos.

**Invariantes (normativos):**

- Voto **não** substitui política: não faz faixa bloqueada entrar na fila.
- Voto **não** representa compra de obra nem licença pública — comunicação ao usuário deve ser consistente com o [Manifesto](../MANIFESTO.md).
- O sistema deve evitar que o participante **interpreta** voto como “direito de tocar” — é **priorização** dentro do permitido.
- Para **analytics** e comparação entre fontes de catálogo, convém que o item votado preserve **ISRC** quando disponível ([03-domain-model.md](03-domain-model.md), [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md)).

- **Empate:** desempate por timestamp do voto, ordem de chegada na fila, ou regra fixa documentada na implementação — deve ser **estável** e **explicável**.
- **Limite de votos** por sessão ou por janela de tempo — recomendado; números em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md).
- **Anti-fraude básico:** captcha leve, cooldown, ou validação server-side — nível MVP discutido em [11](11-backend-and-integrations-open.md).
- **Identidade verificável:** no **momento** em que o voto ou a proposta **alteram** a fila coletiva — após o fluxo **valor → por quê → dados** descrito no MVP — o participante deve estar autenticado com **provedor de identidade** (OAuth); sinais secundários (IP, dispositivo) complementam **sem** substituir o login — ver [../mvp/05-identidade-fosso-participante-voto.md](../mvp/05-identidade-fosso-participante-voto.md).

## Fichas (chips)

**Definição:** mecanismo opcional em que **votar** consome **fichas** adquiridas no estabelecimento (ou via fluxo definido pelo dono).

**Normativo:**

- Ficha paga **participação** (voto, prioridade), **não** a música.
- UI e textos legais de balcão devem reforçar essa separação; ver também [07-ux-copy-and-states.md](07-ux-copy-and-states.md).

**Estados sugeridos:**

- Economia de fichas **desligada** — votos gratuitos dentro dos limites anti-abuso.
- **Ligada** — votos debitam saldo; saldo zero leva a mensagem clara de como obter fichas **no espaço**, não paywall genérico “pague streaming”.

## Modelo de fila: notas de evolução

Duas variantes aceitáveis conceitualmente:

1. **Fila única** — proposta vira item imediato ou é rejeitada.
2. **Proposta + moderação** — item entra como “pendente” até o dono/auto-regra aceitar; votação só em itens “no ar”.

A escolha afeta backend e UX; permanece como decisão em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md) até fechamento.
