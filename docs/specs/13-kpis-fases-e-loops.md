# KPIs por fase, loops de crescimento e instrumentação

## Propósito desta spec

Este documento **complementa** [01-vision-and-scope.md](01-vision-and-scope.md): lá estão objetivos de negócio e critérios de sucesso do MVP no sentido **funcional**; aqui estão **métricas de resultado**, **hipóteses de crescimento** e **requisitos mínimos de medição** para não confundir “funciona na demo” com “gera hábito e escala”.

Trechos normativos (“deve”) referem-se ao que o produto **precisa ser capaz de observar** para cumprir decisões de growth com rigor. Demais trechos são **sugestão** de KPIs e metas — ajustáveis por aprendizado.

## Princípios de medição

### Leading vs lagging

- **Leading (antecipam):** sinais que aparecem **antes** da retenção consolidada — ex.: tempo até primeira interação válida, profundidade na primeira sessão, taxa de compartilhamento com UTMs/códigos de contexto.
- **Lagging (confirmam):** retenção em janelas (D14, D28, D90), receita recorrente implícita em **fichas** (quando existir), churn de **players** (lado oferta).

**Recomenda-se** revisar leading toda semana nas fases iniciais; lagging em cadência mensal ou quinzenal.

### Dois lados do sistema (ovo e galinha explícitos)

O Muziks depende de **oferta** (players ativos, bem operados) e **demanda** (participantes que entram, votam, voltam). Misturar os dois num único “MAU” **obscurece** diagnóstico: é possível crescer participantes em um conjunto pequeno de locais, ou cadastrar muitos players mortos.

**Sugestão:** painel mínimo com quatro famílias:

| Família | Pergunta que responde |
|--------|------------------------|
| Oferta (dono / player) | Quantos **contextos reais** rodam com política estável? |
| Demanda (participante) | Quantas **pessoas** participam com intenção, não só clique? |
| Ponte (sessão) | O encontro oferta × demanda **gera valor** naquele dia? |
| Loop (viral / indicação) | Participação **gera** novo acesso a outro player ou reentrada? |

### Definições operacionais (evitar “era difícil medir”)

Sem definições estáveis, cohort de D14/D28/D90 vira debate. **Deve** existir decisão explícita (e documentada junto ao backend, ver [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md)) para:

- **Participante:** identidade primária (conta, dispositivo estável, cookie first-party, etc.) e regras de **mesclagem** (quando dois sinais são a mesma pessoa).
- **Sessão:** início/fim de uso contínuo ligado a um **player** (ou tentativa de acesso).
- **Player ativo:** player com **pelo menos uma sessão com participação** na janela (definir “participação” — ex.: ≥1 voto válido ou ≥1 ação de fila conforme [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).
- **Retorno:** participante (ou dono, se métrica B2B) que teve sessão no dia 0 e **volta** a ter sessão dentro da janela D+N **no mesmo produto**, idealmente **no mesmo player** ou com **atribuição** de canal (ver cohort por origem abaixo).

## Loops, hipóteses e leitura de “cauda longa”

### Loop “player gera user, user gera player”

- **Player → participante:** descoberta por link, QR, telão, GPS/slug — ver [05-discovery-and-access.md](05-discovery-and-access.md) e [12-telao-display-publico.md](12-telao-display-publico.md).
- **Participante → novo player / novo contexto:** compartilhamento (“leva o link pra casa”), **indicação** de dono a dono, ou **exposição física** (telão em outro evento).

**Sugestão de métricas de saúde do loop:**

- Taxa de **compartilhamento** por sessão (e por “sessão feliz”, ex.: após voto bem-sucedido).
- **Profundidade** na sessão: votos por participante, tempo com fila visível interagindo.
- **Cadeia de indicação:** profundidade ≥2 (A convida B que gera sessão em player distinto ou reativação).

### Retenção D14, D28, D90

Cohorts clássicos respondem: o produto está virando **hábito** ou é curiosidade pontual?

- **D14:** sinal de **repetição** precoce (ainda ruidoso em nichos pequenos).
- **D28:** um **ciclo social** completo para muitos espaços (fins de semana, payroll mental).
- **D90:** hábito e **resistência** a alternativas; útil para leitura de “capitalidade” de aprendizado (base que ensina o produto).

**Recomenda-se** acompanhar também **D1 e D7** nas fases iniciais: são mais sensíveis a bugs, política mal calibrada e atrito de descoberta.

### Engajamento como eixo central

Engajamento **não** substitui retenção, mas **alimenta** retenção e viralidade: fila viva, votos significativos, retorno ao **mesmo** espaço.

### Cauda longa no começo, efeitos mais fortes depois

No início, crescimento de base de **players** e de **sessões qualificadas** tende a ser **linear e lenta** (cada espaço é uma venda/adoção). Quando há **densidade** (mesmo bairro, mesma cena, mesmo tipo de evento), o mesmo engajamento pode parecer **desproporcional** porque reforça prova social e reduz custo de explicar o produto.

**Implicação para metas:** nas fases A/B, **não** usar apenas métricas de escala tipo MAU global; privilegiar **densidade**, **ativação** e **qualidade de sessão** em cohorts pequenos e bem acompanhados.

## Dimensões fáceis de subestimar (além de retenção e viral)

### Ativação (time-to-value)

- Tempo até **primeiro voto válido** ou primeira ação de fila **aceita pela política**.
- Taxa de abandono **antes** da primeira vitória.

Sem ativação, D90 mede **supervivência de curiosos**, não de usuários do produto.

### Liquidez da experiência (fila viva)

Métricas ligadas a [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md):

- Tempo com fila **sem itens elegíveis** a voto ou escolha.
- Itens que recebem **pelo menos um voto** vs itens “invisíveis”.
- “Sessão seca”: entrou, não houve interação possível (fila política vazia demais ou UX quebrada).

Viralidade sobre fila morta **amplifica frustração**, não crescimento sustentável.

### Participação desigual e espectadores (fit de mercado)

Nem todo participante precisa votar em toda sessão — ver [agencia-pertencimento-e-aderencia-comportamental.md](../disruption/agencia-pertencimento-e-aderencia-comportamental.md).

- **Não** usar “% de cadastros que votaram” como única métrica de sucesso em piloto.
- **Sugerir** acompanhar: razão espectador → primeira ação válida; profundidade **entre quem ativou**; liquidez da fila no **espaço com fit** (ICP).
- Baseline histórico: concentração em poucos super-usuários ([05-insights](../analytics/reports/05-insights-para-muziks-hoje.md)) — limites de voto/cooldown são produto, não falha de educação do público.

### Confiança, abuso e operação (B2B2C)

Riscos em [05-discovery-and-access.md](05-discovery-and-access.md) e [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md) sugerem acompanhar:

- Incidentes de **abuso** / necessidade de **revogar** link ou apertar raio.
- Taxa de **erros de estado** ou inconsistência fila ↔ UI.
- **Churn de dono** após incidente (leading de confiança).

### Cortesia eficaz (política × UX)

- Razão **tentativa negada** / **recuperação** (usuário faz segunda ação válida na mesma sessão).
- Correlação entre picos de negação e **abandono** na sessão seguinte.

Isso liga métrica ao princípio de **não humilhar** o participante quando algo é bloqueado ([Manifesto](../MANIFESTO.md), [07-ux-copy-and-states.md](07-ux-copy-and-states.md)).

### Cohort por origem de descoberta

Separar, quando possível: **QR/telão**, **link compartilhado**, **slug**, **GPS + raio**. O mesmo D28 pode ser ótimo num canal e ruim noutro — evita otimizar o funil errado.

### North Star (candidato)

Uma métrica âncora **composta**, além do painel detalhado:

**Sessões com participação significativa por player ativo por semana** — onde “participação significativa” é definida numericamente (ex.: ≥N votos ou presença de ≥M participantes distintos), revisável por fase.

Objetivo: uma leitura que **exige** oferta e demanda saudáveis ao mesmo tempo.

### Meta de piloto (fase A / PoC) — derivada do arquivo legado

Não usar “bares cadastrados” ou “players criados” como sucesso. Sugestão explícita até haver baseline própria:

| Métrica | Definição operacional sugerida |
|---------|--------------------------------|
| **Noite qualificada** | Uma sessão/noturno em que o player teve **≥50 participantes distintos** com ≥1 voto válido (ou ≥1 ação de fila aceita) |
| **Piloto bem-sucedido** | ≥1 espaço ICP atinge **noite qualificada** em **2 fins de semana** dentro de 4–6 semanas de piloto |

Complementa a leitura 80/20 da oferta ([01-oferta-players](../analytics/reports/01-oferta-players.md)): poucos espaços geram quase todo o valor — o GTM deve **espelhar** essa concentração, não diluir esforço em cadastros inativos.

## KPIs sugeridos por fase

Alinhamento conceitual aos objetivos em [01-vision-and-scope.md](01-vision-and-scope.md) (validar tração, reduzir atrito, engajar público). **Valores-alvo numéricos** ficam fora desta spec até haver baseline.

| Fase | Foco estratégico | Leading (exemplos) | Lagging (exemplos) |
|------|------------------|--------------------|--------------------|
| **A — Validação / MVP** | Provar o loop mínimo “público participa; espaço manda na política” | Time-to-first voto válido; taxa de erro/recovery; estabilidade de sessão | NPS operacional informal; # de players com ≥1 sessão “feliz” documentada |
| **B — Tração** | Hábito e primeiros efeitos de rede locais | D1/D7; profundidade (votos/sessão); compartilhamentos; cohort por canal | D14; crescimento de **sessões qualificadas** por player ativo |
| **C — Escala** | Crescimento composto, defesa por dados e operação | Profundidade em cohorts maduros; profundidade de cadeia de indicação | D28/D90; churn de player; “densidade” geográfica ou por segmento |

## Instrumentação mínima (capacidade estrutural)

Medir D14/D28/D90 com credibilidade **não** é só “ligar o Google Analytics”: é **contrato de eventos**, **identidade**, **atribuição** e **privacidade** alinhados a [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md).

**Deve** ser possível, a partir dos dados do produto, reconstruir pelo menos:

1. **Entrada** em contexto de player (fonte atribuída quando houver parâmetros).
2. **Política aplicada** em tentativas relevantes (sucesso/negado/categoria de negação agregada, sem expor PII indevida).
3. **Voto ou ação de fila** válida vs inválida (semântica alinhada a [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).
4. **Compartilhamento** ou cópia de link (mesmo que proxyado por “abrir menu de compartilhar”).
5. **Heartbeat de sessão** ou fechamento explícito — para duração e abandono.
6. **Lifecycle do player** (criado, publicado, pausado, revogado) para correlacionar churn de dono com incidentes.

Esta lista é **conceitual**; o desenho técnico evolui em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md). Tratar essa capacidade como **investimento contínuo**, não como relatório opcional: ela reduz custo de aprendizado por ciclo e evita discutir crescimento sem base comum.

## Fora de escopo desta spec

- Definir stack de analytics, warehouses ou ferramentas de BI.
- Estabelecer metas financeiras ou valuation.
- Substituir compliance legal; bases de dados pessoais seguem [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md).
