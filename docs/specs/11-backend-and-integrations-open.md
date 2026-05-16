# Backend, dados e integrações (decisões abertas)

Este documento lista **o que ainda não está fechado** para o Muziks existir de ponta a ponta, com **critérios** para decidir. Nada aqui bloqueia leitura das outras specs; elas descrevem comportamento desejado **assumindo** que haverá serviços que suportem o domínio ([03-domain-model.md](03-domain-model.md)).

## 1. Backend e persistência

**Pergunta:** Onde vivem player, política, fila, votos e fichas?

**Opções típicas:** API própria (REST/JSON-RPC/GraphQL), BaaS (Firebase, Supabase, etc.), serverless + DB.

**Critérios de escolha:**

- Latência e **tempo real** (WebSocket/SSE/polling) para fila e votos.
- Modelo de dados expressivo para **regras em camadas** e **calendário** ([04-rules-firewall.md](04-rules-firewall.md)).
- Custo operacional vs velocidade de MVP.
- Portabilidade (evitar lock-in extremo se for anti-objetivo do time).

**Saída esperada:** decisão documentada neste arquivo (migrar para [09](09-frontend-architecture.md) ou nova spec de API quando fechar).

## 2. Autenticação e identidade

**Pergunta:** Participantes são anônimos (sessão), magic link, OAuth social, ou mistura?

**Critérios:**

- Equilíbrio entre **baixo atrito** e **anti-fraude** ([06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).
- LGPD e minimização de dados ([08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md)).

**Direção sugerida (pacote MVP):** **superfície pública** (fila/estado não sensível, busca exploratória) **sem** login forte; no **ato** de votar ou enviar proposta vinculante — **depois** de explicar o “por quê” — **OAuth** (Google, Apple, Meta/Facebook conforme disponibilidade); **não** exigir Spotify/Deezer só para participar. Sinais secundários (IP, id de instalação) como camada de risco. Detalhe: [../mvp/05-identidade-fosso-participante-voto.md](../mvp/05-identidade-fosso-participante-voto.md).

## 3. Fonte do catálogo musical

**Pergunta:** De onde vêm gênero/artista/faixa para política e busca?

**Opções:** integração com provedor de streaming, base própria, upload, híbrido.

**Critérios:**

- Capacidade de aplicar **firewall** com metadados confiáveis ([04-rules-firewall.md](04-rules-firewall.md)).
- **Compliance** com termos do provedor e com execução pública (fora do escopo de “ficha de voto”, mas crítico para o negócio) — guardrails em [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md).

### ISRC como “fosso” e lingua franca entre fornecedores

O **ISRC** (*International Standard Recording Code*) é o identificador **global** da **gravação** (fonograma), independente de loja ou app. Tratá-lo como **chave canónica interna** do Muziks cria uma **vantagem estrutural**: metadados vindos de **Spotify, Apple Music, YouTube Music, Deezer**, etc. **convergem** para o mesmo endereço lógico, o que:

- permite **interfaces e APIs globais** (“esta faixa” = este ISRC), com mapeamento opcional para o URI que cada SDK exige na hora de tocar;
- aumenta **precisão na curadoria** (bloqueio/liberação por faixa não se perde ao trocar de provedor ou ao corrigir grafia de título);
- viabiliza **condensação de comportamentos** — votos, pedidos repetidos, heatmaps e cohorts por **obra gravada** real, em vez de duplicar contagens por ID regional do catálogo.

**Requisitos de implementação (quando o catálogo for fechado):** ingerir ISRC sempre que a fonte o fornecer; manter tabela de **alias** `provedor + id nativo → isrc`; definir política para **faixas sem ISRC** (só ID nativo, possível enriquecimento posterior). Referência normativa do esquema: [IFPI — ISRC](https://isrc.ifpi.org/). O ISRC **não** substitui licença de uso nem ECAD; apenas alinha **identidade técnica** — ver [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md).

## 4. Reprodução de áudio

**Pergunta:** Onde o áudio toca — apenas no dispositivo do dono, multi-dispositivo, ou integração com sistema do estabelecimento?

**Critérios:** latência, licença, complexidade de instalação no bar/carro — alinhamento à tese de produto em [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md) (reprodução via provedor do usuário; Muziks como orquestração de fila e política).

## 5. Modelo exato da fila

**Pergunta:** Proposta entra direto vs estado “pendente”? Dono pode reordenar à mão sempre?

**Critérios:** UX do público vs controle do dono ([06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).

## 6. Fichas: ledger e fraude

**Pergunta:** Quem emite saldo, como auditar, como impedir duplicação?

**Critérios:** simplicidade de MVP vs risco financeiro/reputacional.

## 7. API pública e versionamento

**Pergunta:** Contrato da API, autenticação de dono vs público, limites.

**Critérios:** segurança ([08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md)), DX do front.

## 8. Notificações push (futuro)

**Pergunta:** Usar Web Push para “sua faixa subiu”?

**Critérios:** valor vs permissões iOS; privacidade.

## 9. Curadoria contextual com agentes (futuro)

**Pergunta:** Oferecer camada opcional de **agente curador** sobre o firewall estático (*mood* da fila, pedidos no limite, “essência do espaço”)?

**Critérios:**

- **Previsibilidade** e precedência: regras duras (dia, gênero, artista, faixa) **sempre** vencem o agente ([04-rules-firewall.md](04-rules-firewall.md)).
- **Transparência** para participante e dono (motivo humano, log, opt-out total).
- Custo, latência, privacidade ([08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md)); não confundir com licenciamento de obra ([14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md)).

**Hipótese de produto:** [firewall-curador-com-agentes.md](../disruption/firewall-curador-com-agentes.md). **Fora do MVP** ([01-vision-and-scope.md](01-vision-and-scope.md)).

## 10. Rajada, tempo real e custo (direção PoC)

**Contexto:** exports 2016–2017 mostram picos de **centenas de pedidos por bar por dia** em janelas curtas ([03-ponte-pedidos-e-sazonalidade](../analytics/reports/03-ponte-pedidos-e-sazonalidade.md)).

**Direção para fechar (MVP em *free tier*):**

| Caminho | Uso |
|---------|-----|
| **HTTP `POST` /vote** | Escrita com validação de política + identidade |
| **Rate-limit** | Por `participant_id`, IP e opcionalmente dispositivo — proteger contra “super usuários” e brigading |
| **Fila de votos** | Inserir evento; worker ou transação serializada aplica contagem — evita lock storm no mesmo `queue_item` |
| **HTTP `GET` /queue** + **Cache-Control** | Leitura para clientes e telão; polling **3–5 s** |
| **Supabase Realtime** | Evitar subscrição **por participante** no salão; reservar para admin ou adiar |

Detalhe de custo: [02-viabilidade-custos-comparativo.md](../mvp/02-viabilidade-custos-comparativo.md).

## 11. Busca tolerante a erros (fuzzy)

**Contexto:** termos de busca com typos e grafias alternativas são frequentes no histórico ([04-catalogo-busca-vs-tocada](../analytics/reports/04-catalogo-busca-vs-tocada.md)).

**Requisitos quando o catálogo fechar:**

- Camada de **fuzzy match** (Levenshtein, trigram ou índice do provedor) sobre título/artista antes de devolver “não encontrado”.
- Normalização (case, acentos, remoção de “ao vivo”, etc.) alinhada a alias **ISRC** (secção 3).
- UX de **recovery** quando a busca não casa com play — [07-ux-copy-and-states.md](07-ux-copy-and-states.md).

---

## Próximos passos sugeridos

1. Fechar **backend + auth + modelo de fila + rajada/polling** (itens 1, 2, 5, 10) — desbloqueia MVP técnico.
2. Fechar **catálogo + reprodução** (itens 3, 4) — desbloqueia demo pública realista.
3. Tratar **fichas** como camada opcional após voto estável (item 6).

Quando cada item fechar, **remover ou encurtar** a seção correspondente aqui e registrar a decisão na spec mais próxima (domínio, PWA, NFR).
