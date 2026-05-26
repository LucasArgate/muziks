# Agência, pertencimento e aderência comportamental

**Referência:** maio/2026. **Tipo:** tese de **produto + mercado** — honestidade sobre a “bolha” de quem ama música e evolução da proposta Muziks (2013–2026).

**Rascunho de origem:** [love-notice-experience.md](../notes/love-notice-experience.md) (nota de fundador).

---

## Evidência (campo e memória)

Em conversa recente, **Alcides** (fundador original do Muziks, 2013) trouxe um ponto crítico:

> “A única coisa que eu acho que sempre foi o principal desafio é essa mudança de comportamento. As pessoas não ligam muito pra música a ponto de quererem escolher o que está tocando no lugar. Tipo, não é uma dor principal do dono do bar nem do cliente. A gente é uma bolha.”

Esse relato **não contradiz** a pesquisa de empatia nem o manifesto — **complementa** com o risco clássico de founder: construir para quem já é curador apaixonado. Ver também limitações de evidência em [design-thinking-evidence-and-inferences.md](./design-thinking-evidence-and-inferences.md) e baseline operacional (não TAM atual) em [analytics/README.md](../analytics/README.md).

---

## Tese revisada (2026)

### Diagnóstico aceito

A maioria das pessoas **não** trata curadoria musical como dor principal no bar. Dono e cliente podem estar satisfeitos com “som de fundo” ou com uma única mão no Bluetooth.

### Proposta que evoluiu

O Muziks **não** tenta converter todo mundo em curador. A intenção é:

| Princípio | Significado para o produto |
|-----------|----------------------------|
| **Facilitar, não convencer** | Caminho mínimo para quem já tem desejo latente de participar; sem onboarding que exija “amar música”. |
| **Espalhar de forma orgânica** | Telão, QR, prova social — comportamento que **parece natural** no contexto, não campanha educativa. |
| **Baixo esforço, agência real** | Quem não liga tanto ainda pode votar ou marcar presença com **um toque** e sentir que influenciou o ambiente. |

### O que vendemos (e o que não vendemos)

| Não é o núcleo da promessa | É o núcleo da promessa |
|---------------------------|------------------------|
| “Amor por música” / curadoria como hobby | **Agência** e **pertencimento** no ambiente coletivo |
| “Escolha a música” (jargão de streaming) | “Influencie o rolê” / “Deixe sua marca na noite” |
| Produto para todo tipo de espaço | Valor **transformador** em nichos; “legal” em outros — aceito |

Isso **alinha** com participação emocional opcional ([conexao-emocao-economia-da-fila.md](./conexao-emocao-economia-da-fila.md)) sem confundir gesto simbólico com “virar DJ da noite”.

---

## Contexto que mudou (2015–2017 → 2026)

O que era **fricção** na primeira geração do produto tende a ser **fluido** hoje — não garante tração universal, mas **reduz barreira** onde já existe fit de espaço.

| Aspecto | 2015–2017 | 2026 | Impacto esperado |
|---------|-----------|------|------------------|
| QR Code | Barreira cognitiva, leitura nem sempre nativa, desconfiança e necessidade ocasional de app externo | Comportamento normalizado por cardápios, pagamentos, check-ins e links físicos | + aderência na entrada, desde que haja copy clara e fallback por link/slug |
| Celular em grupo | Menos habitual | Totalmente normalizado | + facilidade de voto |
| Participação digital | Emergente | Consolidada (redes, apps) | + expectativa de interatividade |
| Interação digital no físico | Cardápio/pagamento ainda em adoção | Pós-pandemia: cardápio, check-in | + fluidez do fluxo Muziks |
| Fronteira legal do produto | Mais difícil explicar “o que o Muziks entrega” sem parecer player/licença de música | Papel documentado como camada de fila, política e participação sobre reprodução do dono/provedor | + confiança para pilotos, termos e abordagem comercial |

**Honestidade:** esta tabela é **hipótese de contexto**, não A/B test documentado. Validar em pilotos ([13-kpis-fases-e-loops.md](../specs/13-kpis-fases-e-loops.md), [05-insights](../analytics/reports/05-insights-para-muziks-hoje.md)).

### Necessidade não declarada vs valor experimentado

O diagnóstico “ninguém liga tanto para música” continua útil como antídoto contra bolha founder. A leitura imparcial é mais específica: muitas pessoas não sentem falta de uma ferramenta para influenciar a música **antes** de existir uma oportunidade simples, segura e socialmente aceita de fazê-lo.

Produtos de mudança comportamental raramente começam como necessidade explícita para todos. O Muziks deve validar se, em espaços com fit, a experiência de **interferir dentro de limites** cria agência e pertencimento suficientes para virar hábito leve — sem presumir que o público queira virar curador, DJ ou dono do som.

---

## Sinais de demanda (qualitativo + histórico)

| Sinal | Leitura |
|-------|---------|
| Cliente antigo pediu o player de volta (**início 2026**) | Dor **persiste** num segmento de donos, mesmo com produto imaturo |
| Baseline 2016–2017: picos por bar/noite, **Poco Loco** como referência | Tração **concentrada** em ICP forte, não na média do CRM — ver [05-insights](../analytics/reports/05-insights-para-muziks-hoje.md) |
| Super-usuários (top 10% → 60% dos pedidos) | Participação **desigual** é normal; produto deve **limitar dominância** sem exigir que todos votem igualmente |

Conclusão operacional: existe **dor real em nicho**, não mercado universal de “todo mundo quer escolher música”.

---

## Implicações para produto e docs

### Reforça (já especificado ou em hipótese alinhada)

| Decisão | Onde está |
|---------|-----------|
| ICP: espaços onde música **já importa** para a experiência (identidade, evento, público jovem/universitário) | [01-receita-rentabilidade-e-go-to-market.md](../business/01-receita-rentabilidade-e-go-to-market.md); piloto ≥50 participantes/noite em [05-insights](../analytics/reports/05-insights-para-muziks-hoje.md) |
| Fricção mínima: QR no telão, voto em 1 toque, identidade só no portão da ação | [12-telao-display-publico.md](../specs/12-telao-display-publico.md); [05-discovery-and-access.md](../specs/05-discovery-and-access.md); [mvp/05-identidade-fosso-participante-voto.md](../mvp/05-identidade-fosso-participante-voto.md) |
| Prova social visível (fila, avatares, “quem escolheu”) | [12-telao-display-publico.md](../specs/12-telao-display-publico.md); [06-queue-voting-and-chips.md](../specs/06-queue-voting-and-chips.md) |
| Copy: agência no ambiente, não “curadoria” | [07-ux-copy-and-states.md](../specs/07-ux-copy-and-states.md) |
| Métricas que não punem “nem todo mundo vota” | [13-kpis-fases-e-loops.md](../specs/13-kpis-fases-e-loops.md) — liquidez da fila, profundidade por sessão, não MAU genérico |

### Não justifica (anti-padrões)

- Ignorar a bolha ou falar só para founders que amam música.
- Superestimar o “amor médio” por música no copy ou no onboarding.
- UX que exige alto envolvimento **antes** da primeira vitória (voto ou gesto aceito).
- Tratar baixa participação em **espaço errado** como falha de produto — pode ser **fit**, não bug.

---

## Tensão com outras teses do repositório

| Tema | Tensão | Resolução no desenho atual |
|------|--------|----------------------------|
| Democracia da fila vs gesto pago | Quem paga não pode parecer “comprar a fila” | Camadas em [conexao-emocao-economia-da-fila.md](./conexao-emocao-economia-da-fila.md); firewall e teto |
| “Democratizar a música” (manifesto) | Pode soar como “todo mundo é curador” | Manifesto = **democracia com política**; esta nota = **participação opcional com baixo atrito** |
| Telão e viralidade | Amplificar espaço sem liquidez | [13-kpis](../specs/13-kpis-fases-e-loops.md) — “sessão seca” e fila viva antes de escalar marketing |

---

## Lacunas abertas (próximo trabalho de produto)

- **ICP refinado** por tipo de espaço (checklist objetivo de fit, não só narrativa).
- **Metas de piloto** que aceitem participação desigual e espectadores satisfeitos (ver sugestão em [13-kpis](../specs/13-kpis-fases-e-loops.md)).
- **Testes de copy** A/B entre “influenciar o rolê” e variantes locais — resultados a registrar neste ficheiro ou em [07-ux-copy](../specs/07-ux-copy-and-states.md).

---

## Ligações rápidas

- [Mapa de dores](./mapa-dores-e-solucoes.md) — linha “bolha / mudança de comportamento”
- [Visão e escopo](../specs/01-vision-and-scope.md) — premissa de tração e MVP
- [Personas e jornadas](../specs/02-personas-and-journeys.md) — dono como curador **sem** microgerenciar cada pedido
