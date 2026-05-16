# Receita, rentabilidade e *go-to-market*

**Referência:** maio/2026. **Tom:** “*Talk is cheap — show me the money*” como **pergunta de produto**, não como promessa de lucro imediato. Este texto **mapeia opções** e **trade-offs**; não é consultoria financeira nem jurídica.

**Leitura obrigatória em paralelo:** [02-viabilidade-custos-comparativo.md](../mvp/02-viabilidade-custos-comparativo.md) — sem **margem** (receita − custo fixo/variável − tempo humano), “barato na cloud” ainda pode **fechar no prejuízo** se o suporte e o *sales* não estiverem desenhados.

---

## 1. Mapa: além de “mensalidade” e “fichas”

“Mensal” e “ficha” são **âncoras mentais** fortes no Brasil (karaokê, consumo no balcão). O Muziks pode **combinar** ou **substituir** por mecanismos que casam melhor com **software + evento ao vivo**.

| Mecanismo | O que o cliente compra | Quando faz sentido | Risco / cuidado |
|-----------|------------------------|--------------------|-----------------|
| **Assinatura por espaço** (*venue*) | Direito de uso contínuo + N players/sessões | Operação recorrente (bar semanal) | Precisa definir limites (MAU, votos) para não sangrar em megaeventos |
| **Pacote por temporada / campanha** | Meses fechados (ex.: “junho–agosto”) | Bares com sazonalidade forte | Renovação e *churn* previsível |
| **Licença por noite / evento** | Uma data, pico alto, suporte opcional | Festas privadas, *one-off* | Operação de billing e suporte em picos |
| **Por uso** (sessões, horas de *player* ativo, volume de votos) | Alinha receita a intensidade | Quem tem medo de “pagar ocioso” | Complexidade de medição e disputa (“o que é uma sessão?”) |
| **Por assento / por mesa** | Capacidade simultânea | Espaços que escalam mesas | Pode confundir com “ficha” se mal comunicado |
| **Taxa de implantação / onboarding pago** | Configuração, treino, QR, *branding* inicial | Dono de bar que não quer DIY | Não pode ser **única** fonte se o produto for SaaS de baixo ticket |
| **Add-ons** (marca no telão, temas, *moderation* extra, relatórios) | Camadas sobre um plano base | *Land and expand* | Evitar fragmentar demais o catálogo no MVP |
| **Patrocínio / mídia no espaço** (B2B2C) | Marca em momentos do fluxo (com acordo explícito) | Redes, bebidas, *labels* | Transparência com participante; alinhar a [privacidade](../specs/08-nfr-privacy-accessibility.md) e [legal](../specs/14-fronteiras-legais-direitos-autorais.md) |
| **Slots de áudio / “rádio do espaço”** | Interrupção controlada do *playback* para *spots* (próprio ou parceiro) no **mesmo player/telão** | O ativo já está no salão: **atenção**, **som**, **QR**, **público** — sem novo *hardware* conceitual | Direito de **obra**/trilha do *spot*; expectativa de quem veio “tocar fila”; ver [02-canal-midia-radio-do-espaco.md](02-canal-midia-radio-do-espaco.md) |
| **Assinatura do participante / “espaço romântico”** | Mensalidade (ou créditos) que **acumulam** e gastam **peso** ou **mensagens** (ex.: românticas) **só** dentro da política do espaço | Sustenta a plataforma **além** do B2B; monetiza **emoção e gesto**, não obra | Perceção de *pay-to-win*; moderação, consentimento, idade; ver [03-espaco-romantico-prioridade-e-sustentabilidade.md](03-espaco-romantico-prioridade-e-sustentabilidade.md) e [conexao-emocao-economia-da-fila.md](../disruption/conexao-emocao-economia-da-fila.md) |
| **Parceria com distribuidor / instalador** | “Muziks incluso no pacote de som” | Escala regional sem time grande | Margem compartilhada; contrato claro |
| **Certificação / lista de hardware compatível** | Menos dor de cabeça para o dono | Quando integração física for crítica | Não virar gatekeeper abusivo se o core for OSS |
| **API / integrações premium** | Ecossistema (POS, CRM de evento) | Fase pós-MVP com tráfego | Custo de manutenção de integrações |

**Síntese:** o “dinheiro” costuma vir de **2–3 palanques**, não de um único preço. Exemplo coerente com produto híbrido **social + B2B** (e **B2C opcional** no participante): **assinatura do espaço** + **pacote de implantação** opcional + **add-ons** de visibilidade / mídia **e/ou** **assinatura leve do participante** (gesto, peso tabelado) **só** com regras explícitas e firewall.

---

## 2. Canal de mídia no player (“rádio do espaço”)

Hipótese em profundidade — dono que **pausa** a música para *spots* próprios ou de parceiros no **mesmo** player/telão, **agenciamento** vs **self-serve**, riscos legais e de expectativa do público: ver **[02-canal-midia-radio-do-espaco.md](02-canal-midia-radio-do-espaco.md)**.

---

## 3. Participante: espaço romântico, mensagens e peso na ordem

Hipótese B2C — **assinatura mensal** (ou equivalente) que **acumula**, **respeita regras locais** e dá **peso** ou **expressão** (mensagens românticas, destaque discreto) **dentro** da democracia acordada da fila; ligação **conexão → emoção → atitude** (incluindo pagamento) como sustentabilidade do ecossistema: ver **[03-espaco-romantico-prioridade-e-sustentabilidade.md](03-espaco-romantico-prioridade-e-sustentabilidade.md)** e a disrupção **[conexao-emocao-economia-da-fila.md](../disruption/conexao-emocao-economia-da-fila.md)**.

---

## 4. Viabilidade de negócio (enquadramento)

Para cada modelo acima, responder **em uma página** (pode virar planilha depois):

1. **Quem paga** (dono, rede, produtor, patrocinador).
2. **Custo marginal** (infra por voto/sessão, conforme [02](../mvp/02-viabilidade-custos-comparativo.md)).
3. **Custo humano** (suporte, *onboarding*, visita ao bar — costuma matar MVP se ignorado).
4. **Tempo até receita** ( Founder-led vendas × canal × *self-serve*).
5. **Risco reputacional/legal** (dados, música, telão — ver specs legais).

**Regra prática:** se a receita **não cobre** (infra + impostos + suporte mínimo + *CAC* amortizado), o modelo é **curiosidade**, não plano.

---

## 5. Open source, freemium e infraestrutura gerenciada

Três arquiteturas de “OSS + dinheiro” frequentes — o Muziks pode **evoluir entre elas** sem contradição com “core aberto”, desde que a **licença** e a **marca** estejam claras desde cedo.

No repositório, isso está explícito no ficheiro [`LICENSE`](../../LICENSE) (Apache-2.0) e em [Marca e uso do nome “Muziks”](../legal/marca-e-uso-do-nome.md).

### A) *Open core* (núcleo aberto, recursos “de operação” fechados)

- **Aberto:** cliente, protocolos, parte do servidor, *self-host* documentado.
- **Pago:** hospedagem gerenciada, backups, SSO, multi-espaço, SLA, filas avançadas, painel de rede.

**Receita:** assinatura **hosted** + serviços. **Comunidade:** reduz atrito para devs e cria defensibilidade por **distribuição** e **plugins**.

### B) OSS “puro” + patrocínio + serviços

- **Aberto:** quase tudo; receita de **consultoria**, **instalação**, **treinamento**, **Open Collective** / GitHub Sponsors.
- **Infra:** quem *self-host* paga **seu** Supabase/VPS — o projeto não fatura cloud, fatura **tempo** e **confiança**.

**Receita:** escala lenta; ótimo para **validar** e para **narrativa**; ruim sozinho se a meta for **crescimento agressivo** de B2B em bares.

### C) *Freemium* com “linha de corte” clara

- **Grátis:** 1 espaço, limites de MAU/votos, comunidade, sem SLA.
- **Pago:** limites maiores, marca, exportações, suporte priorizado, *multi-player* gerenciado.

**Infra:** o *free tier* **subvenciona** aquisição — exige **teto técnico** (cotas) e **disciplina** para não virar prejuízo silencioso (ver egress/MAU no doc de custos).

### Híbrido recomendado como **linha de raciocínio** (hipótese)

| Camada | Público | Promessa |
|--------|---------|----------|
| **Código + docs** | Dev, entusiasta, integrador | “Funciona na minha garagem e no meu bar teste” |
| **Cloud Muziks** (nome a definir) | Dono que não quer servidor | “Ligo na noite e tenho número pra ligar” |
| **Parceiro** (som, instalação) | Dono que compra “pacote” | “O técnico já traz o Muziks certo” |

---

## 6. Duas personas de receita: dev / entusiasta × dono do bar

O mesmo produto **não** precisa ter o mesmo **pacote** para os dois; confundir isso gera *pricing* que ou afasta o dev ou **regala** suporte enterprise.

### Dev ou entusiasta (baixo toque humano)

- **Self-host**, Docker, variáveis de ambiente, exemplos, [servidor Discord](../tech/MEIOS-DE-COMUNICACAO-E-OPERACAO.md) / GitHub Discussions.
- **Preço:** R$ 0 no software; opcionalmente **sponsor** ou **donation**.
- **Objetivo:** distribuição, *issues* de qualidade, parceiros técnicos, **reduzir CAC** indireto (“quem instalou foi o DJ da região”).

### Dono do bar (alto valor percebido, baixa tolerância a falha)

- **Wizard**, modelo “ligue e funcione”, **QR pronto**, política de fila explicada em linguagem de balcão.
- **Preço:** assinatura + opcional **setup**; **suporte** contabilizado como custo, não como “bondade”.
- **Objetivo:** receita recorrente e **case** público (com permissão).

**Pontes entre os dois:** parceiros (instaladores) que são **dev-adjacent**; certificação leve; programa “**ambassador**” regional — sem misturar **SLA** de pagante com **best effort** de comunidade.

---

## 7. Escalar: comercial, marketing e operações leves

### Fase 0 — *Founder-led* (antes de “time”)

- **Vendas:** conversa direta com **3–5** espaços no **perfil ideal de cliente (ICP)** — alta energia, fluxo jovem/universitário, rotação alta de público no fim de semana (padrão histórico: Poco Loco, 100 Lanchitos, Kabana Bar — ver [01-oferta-players](../analytics/reports/01-oferta-players.md)). **Não** abrir cadastro genérico de bares na PoC.
- **Proposta de valor:** vender **engajamento e retenção de clientes no salão**, não “um player de música bonito”. O dono que adotou no passado tinha **centenas de pessoas** interagindo, não um widget decorativo.
- **Piloto escrito:** escopo, duração, o que medir — ver métrica abaixo.
- **Marketing:** 1 narrativa clara (site + 1 canal — ex.: Instagram de casos ou YouTube curto “antes/depois da fila”).
- **Métrica:** não “vanity” (# bares no CRM, # cadastros pendentes). Alinhar a [13-kpis-fases-e-loops.md](../specs/13-kpis-fases-e-loops.md). **North star do piloto:** ≥1 espaço com **≥50 participantes distintos numa noite** (ou proxy acordado: votos válidos de identidades distintas na janela da sessão).

### Fase 1 — *Repeatable* (alguns cases)

- **Playbook:** PDF ou Notion interno — objeções, preço, instalação, checklist legal mínimo.
- **Comercial parte-time / SDR** ou **freelancer com comissão** só se houver **ticket** e **margem**; caso contrário, **parceiro** (instalador) com **rev share** costuma doer menos no *burn*.

### Fase 2 — Canal (escala regional)

- **Marketing:** conteúdo para **redes de bares** e **fornecedores de áudio**; parcerias com **marcas** só com **produto** para isso (ex.: *slots* de patrocínio consentido).
- **Comercial:** 1 AE + operação de **inside sales** se o *LTV* justificar; senão, manter **parceiro** como frente principal.

### Princípio de alavancagem

- **Não** contratar time grande antes de **(a)** prova de retenção em pilotos e **(b)** custo de suporte por espaço medido.
- **Sim** investir cedo em **material de parceiro** (um-pager, deck, vídeo de 60s) — isso **multiplica** founder e devs na comunidade.

---

## 8. Checklist “show me the money” (para revisão periódica)

- [ ] Para cada plano (grátis/pago), existe **teto** de uso que protege a infra?
- [ ] O dono de bar sabe **em uma frase** o que compra e o que **não** está incluído (música, hardware, internet)?
- [ ] O dev sabe **em uma frase** como *self-host* e onde pedir ajuda **sem** fila de suporte B2B?
- [ ] Há **caminho** de upgrade (free → hosted → parceiro) sem reescrever a stack?
- [ ] Receita prevista ≥ custo documentado em [02](../mvp/02-viabilidade-custos-comparativo.md) + **horas humanas** realistas?

---

## Próximos artefatos (opcionais)

- Planilha simples: **LTV** por tipo de espaço × **CAC** por canal (direto vs parceiro).
- **Matriz de packaging** (1 página): nome do plano, limites, preço-alvo, *deal-breakers* legais.
- **Política de patrocínio e *slots* de áudio** (“rádio do espaço”): aprofundamento em [02-canal-midia-radio-do-espaco.md](02-canal-midia-radio-do-espaco.md); espelhar em specs de UX/privacidade/legal quando virar produto.
- **Participante pago** (peso, mensagens, “espaço romântico”): [03-espaco-romantico-prioridade-e-sustentabilidade.md](03-espaco-romantico-prioridade-e-sustentabilidade.md); fechar caps e copy antes de norma em [06](../specs/06-queue-voting-and-chips.md) / [07](../specs/07-ux-copy-and-states.md).
