# Roadmap da jornada Muziks

## Para que serve este documento

Este é o **mapa da jornada** do Muziks: onde estamos, para onde vamos em etapas **viáveis**, como **aprender** com uso real e como **operar** em modo **IA-first** (humano e máquina em parceria explícita). Ele **não** substitui o [Manifesto](MANIFESTO.md) nem as [especificações](specs/README.md); organiza **tempo, ritos e entregas** em torno da promessa central: **conectar pessoas** no som, com **acordo explícito** e política clara.

**Estado hoje (repositório):** predominância de **análise, especificação, abstração, hipóteses e viabilidade** — o produto ainda **não** existe como software publicado; o trabalho atual solidifica **decisões** e **fronteiras** para que a implementação não reabra o mesmo debate a cada sprint.

---

## Norte inegociável

| Fonte | Papel |
|--------|--------|
| [MANIFESTO.md](MANIFESTO.md) | Intenção, princípios e promessa |
| [specs/](specs/README.md) | Comportamento e engenharia acordados |
| [13-kpis-fases-e-loops.md](specs/13-kpis-fases-e-loops.md) | Métricas, fases de crescimento e o que medir após existir produto |

Se uma entrega **contradiz** o manifesto, o roadmap **cede**; o mapa serve ao propósito, não o contrário.

---

## Fases da jornada (macro)

Cada fase tem **critério de saída** objetivo. **Datas** de início/fim e de **lançamento** ficam em calendário próprio (abaixo); aqui está a **sequência lógica**.

### Fase 0 — Fundação conceitual *(em curso no repo)*

**O quê:** manifesto, evidências de campo, specs de domínio, NFR, legal, fronteiras de integração abertas documentadas.

**Saída:** conjunto mínimo de specs **estáveis o suficiente** para “congelar” um **MVP técnico** (lista de escopo em [01-vision-and-scope.md](specs/01-vision-and-scope.md)) sem ambiguidade crítica em fila, regras e descoberta do player; **hipóteses de receita e *go-to-market*** registradas em [business/](business/README.md) quando forem discutidas (não substituem specs normativas).

### Fase 1 — Arquitetura e stack *(próximo bloco)*

**O quê:** fechar decisões em [11-backend-and-integrations-open.md](specs/11-backend-and-integrations-open.md), alinhar [09-frontend-architecture.md](specs/09-frontend-architecture.md) e [ESPECIFICACAO-FRONTEND.md](tech/ESPECIFICACAO-FRONTEND.md) com **contratos** (API, identidade, sessão, eventos) e **ambientes** (dev, staging, produção).

**Saída:** documento ou specs atualizadas com **stack**, **limites de responsabilidade** entre serviços e **definição de “pronto para codar”** o primeiro incremento.

### Fase 2 — Primeiro software tocável *(MVP interno)*

**O quê:** implementação mínima end-to-end (ex.: um fluxo dono + participante + política + fila em cenário controlado), sem pretensão de escala.

**Saída:** build instalável ou URL interna; **checklist de aceite** derivado das specs; registro de **débitos técnicos** aceitos.

### Fase 3 — Beta fechado *(aprendizado com pessoas reais)*

**O quê:** poucos espaços ou pilotos; observar ativação, fricção de política e clareza de copy; ajustar.

**Saída:** decisões registradas nas specs; **primeiros números** alinhados a [13-kpis-fases-e-loops.md](specs/13-kpis-fases-e-loops.md) (mesmo que manuais no início).

### Fase 4 — Lançamento público *(primeira onda)*

**O quê:** critérios de qualidade, suporte mínimo, comunicação com donos de espaço e participantes; canal de feedback.

**Saída:** **data de lançamento** cumprida com critérios explícitos (estabilidade, privacidade, termos); plano de **iteração** pós-lançamento.

### Fase 5 — Operação e perpetuidade

**O quê:** ciclos curtos de melhoria; revisão periódica de **agentes (IAs)** e de **processo** humano-máquina; expansão de escopo só com **evidência** ou decisão de produto formal.

**Saída:** ritmo sustentável documentado (cadência abaixo); histórico de aprendizados ligado a mudanças nas specs.

---

## Calendário e datas *(a preencher em conjunto)*

| Marco | Data alvo | Dono / fórum de decisão | Notas |
|--------|-----------|-------------------------|--------|
| Congelamento MVP (escopo + riscos) | *TBD* | Time + stakeholders | Amarra [01](specs/01-vision-and-scope.md) com [11](specs/11-backend-and-integrations-open.md) |
| Arquitetura e stack assinados | *TBD* | Time técnico | Evita retrabalho |
| Primeiro build interno | *TBD* | Time | Prova do encadeamento |
| Início beta fechado | *TBD* | Time + pilotos | Número de pilotos a definir |
| **Lançamento público** | *TBD* | Stakeholders | Comunicação e suporte alinhados |
| Retrospectiva pós-lançamento (D+30) | *TBD* | Time | Fecha ciclo de aprendizado inicial |

**Como definir datas:** em **sessão única** (ou série curta) com stakeholders: dependências legais, capacidade humana, risco de integrações externas e **realismo** de pilotos. Este quadro deve ser **atualizado** quando as datas forem escolhidas — o roadmap vive no git.

---

## Ciclos de trabalho (humano + IA)

Modo **IA-first** aqui significa: a máquina **acelera** redação, busca, refatoração de texto e exploração de alternativas; o humano **mantém** alinhamento com manifesto, **julga** risco e **assina** o que vira norma no repositório.

### Cadência sugerida (ajustável)

| Ritmo | Foco | Participantes |
|--------|------|----------------|
| **Semanal** | Progresso de specs/decisões abertas; fila de dúvidas para [11](specs/11-backend-and-integrations-open.md) | Time núcleo |
| **Quinzenal** | Revisão de **melhoria dos agentes**: prompts, regras em `AGENTS.md`, checklist de qualidade das contribuições IA | Quem opera IA no dia a dia |
| **Mensal** | Stakeholders: prioridades, datas, riscos; leitura de **lagging** quando já houver produto | Stakeholders + time |
| **Por entrega** | “Demo” ou incremento: o que aprendemos → **atualizar spec** ou backlog explícito | Time |

### Reviews de agentes (IAs)

Objetivo: o repositório **não** degradar por volume de texto gerado sem critério.

- **Entrada:** amostra de PRs/sessões recentes; falhas recorrentes (alucinação de requisito, conflito com manifesto).
- **Saída:** mudanças em instruções (ex.: [AGENTS.md](../AGENTS.md)), templates de PR, ou trecho “como revisar contribuição IA” neste roadmap.
- **Regra:** toda mudança **normativa** de produto continua em **spec** com revisão humana explícita.

### Reviews com time e stakeholders

- **Time:** aderência técnica, viabilidade, dívida aceita.
- **Stakeholders:** propósito, risco reputacional/legal, narrativa de lançamento, pilotos.

---

## Entregas por ciclo (lógica de fatia)

Cada ciclo deve produzir **uma** ou **poucas** fatias **testáveis**:

1. **Documental:** spec fechada ou seção “Aberto” reduzida com decisão registrada.
2. **Técnica:** componente ou serviço com contrato claro e critério de aceite.
3. **Aprendizado:** hipótese testada (mesmo qualitativamente) e **reflexão** de uma página no PR ou nota ligada ao doc de evidências.

Evitar “ciclo só de ideia” sem artefato rastreável no repositório ou no produto.

---

## Reflexão e aprendizado (pós-2013, pós-2015)

A ideia atravessa anos porque o problema é **social e político**, não só técnico. O roadmap assume:

- **Perpetuidade** vem de **ciclos** curtos + **documentação** que sobrevive à troca de ferramentas e modelos de IA.
- **Resolver como humanos** significa manter **autoria** das decisões difíceis (regras, tom, legal); a IA **não** substitui essa conta.

---

## Documentos irmãos

| Documento | Uso no roadmap |
|------------|----------------|
| [01-vision-and-scope.md](specs/01-vision-and-scope.md) | MVP e fora de escopo |
| [13-kpis-fases-e-loops.md](specs/13-kpis-fases-e-loops.md) | O que medir depois do lançamento |
| [14-fronteiras-legais-direitos-autorais.md](specs/14-fronteiras-legais-direitos-autorais.md) | Guardrails antes de datas agressivas |
| [design-thinking-evidence-and-inferences.md](disruption/design-thinking-evidence-and-inferences.md) | Base empática para priorizar pilotos |
| [business/README.md](business/README.md) | Receita, rentabilidade (incl. OSS/freemium + infra), *go-to-market*; complementa [mvp/02-viabilidade-custos-comparativo.md](mvp/02-viabilidade-custos-comparativo.md) |

---

## Manutenção deste roadmap

- **Quem atualiza:** qualquer mantenedor; mudanças grandes de fase merecem menção em PR com **motivo**.
- **Frequência mínima:** revisar o quadro de **datas** no **review mensal** com stakeholders; revisar **fases** quando uma **saída** for atingida ou explicitamente postergada.

*Última intenção: dar ao Muziks um lugar único para responder “onde estamos?” sem misturar isso com o texto normativo das specs.*
