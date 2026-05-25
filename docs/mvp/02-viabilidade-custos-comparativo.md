# Viabilidade de custos (comparativo) — MVP Muziks

**Referência:** maio/2026. **Moeda:** valores em **R$** para leitura local.

> **Aviso:** preços de provedores, limites de *free tier* e cotação USD/BRL **mudam**. Use este documento como **ordem de grandeza** e confirme **quotas e faturamento** nos sites oficiais antes de orçar ou contratar.

---

## Premissas de conversão

- Taxa aproximada usada nesta estimativa: **R$ 5,00 por USD** (faixa observada ~R$ 5,00–5,07 em maio/2026).

---

## Premissas de uso do projeto (volume estimado)

| Dimensão | Estimativa |
|----------|------------|
| Players ativos | até **20** |
| Pessoas (pico) | máx. **100** (realista **40–80** *concurrent*) |
| Sessão média | **5 h** |
| Sessões / mês | ~**300** (ex.: ~10 sessões/dia) |
| Votos / mês | ~**6.000–10.000** |
| Realtime | **leitura** da fila por polling; **escrita** de votos por HTTP (não WS por cliente) |

Esse volume é **baixo** na média mensal, mas o arquivo legado mostra **rajadas** — centenas de pedidos **num bar num único dia** e picos globais **>1.000/dia** ([03-ponte-pedidos-e-sazonalidade](../analytics/reports/03-ponte-pedidos-e-sazonalidade.md)). O desafio de custo no *free tier* aparece no **pior sábado à noite**, não na média.

### Efeito “rajada” (evidência histórica → arquitetura)

| Fenómeno | Implicação de custo |
|----------|---------------------|
| Tráfego concentrado em poucas horas (fim de semana, eventos) | Cotas de **conexões Realtime**, mensagens e egress precisam ser monitoradas porque cada participante assina `queue.snapshot` |
| Muitos votos simultâneos na mesma faixa | Postgres sob **contenção** sem fila de processamento + rate-limit |
| Telão + dezenas de clientes no salão | Broadcast reduz GETs repetidos, mas desloca o custo para conexões/mensagens Supabase |

**Decisão recomendada para PoC/V1 em tier gratuito:**

1. **Votação:** `POST` HTTP (API Route / Edge) com **rate-limit** por participante e IP.
2. **Leitura da fila (cliente + telão):** `GET` inicial + Supabase Realtime Broadcast `queue.snapshot`; polling HTTP fica como fallback.
3. **Processamento:** fila assíncrona (tabela `vote_events` + worker leve ou `pg` advisory lock) para serializar picos de escrita — ver [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md).
4. **Realtime Supabase:** monitorar conexões/mensagens por sessão; manter `DISABLE_PUBLIC_REALTIME` para voltar a polling se o Free degradar.

Dimensionar quotas Supabase/Vercel pelo cenário **“50 pessoas votam em 2 minutos”**, não pelo cenário “10 sessões/dia espalhadas”.

---

## Tabela de custos mensais estimados (R$)

| Item | Supabase Free | Supabase Pro | AWS self-hosted (básico) | AWS + gerenciado (RDS + outros) |
|------|---------------|--------------|---------------------------|----------------------------------|
| **Preço base** | R$ 0 | R$ 125 | R$ 80–120 | R$ 250–400 |
| **Banco de dados** | Incluso | Incluso | EC2 t3.micro ou t4g.small | RDS db.t4g.micro |
| **Realtime (WebSocket)** | Incluso (limite alto) | Incluso | Socket.io + EC2 ou ElastiCache | + custo extra |
| **Auth + storage** | Incluso | Incluso | Cognito + S3 | Cognito + S3 (RDS cobrado à parte no mesmo stack) |
| **Backup e segurança** | Básico (sem PITR) | Bom | Manual / snapshots | Automático |
| **Manutenção / DevOps** | R$ 0 | R$ 0 | R$ 300–800 *(tempo)* | R$ 100–300 |
| **Custo total estimado** | **R$ 0** | **R$ 125–180** | **R$ 400–1.000+** | **R$ 450–900** |
| **Escalabilidade** | Boa até ~50–80 *concurrent* | Excelente | Alta (com trabalho) | Alta |
| **Facilidade (MVP)** | ★★★★★ | ★★★★★ | ★★ | ★★★ |
| **Recomendado para o Muziks (agora)** | **Sim** | Ideal após tração | Não (ainda) | Não (ainda) |

---

## Supabase (detalhe)

### Free tier

- Deve suportar **confortavelmente** ~20 players e ~100 usuários no cenário acima.
- Limites do *free tier* a **confirmar na documentação oficial** no momento do projeto (referência maio/2026): ordem de **500 MB** de banco, **~50k MAUs**, **~200** conexões realtime, **~5 GB** de *egress*.
- O uso estimado do MVP fica **abaixo** desses patamares no início.

### Pro (~R$ 125/mês na conversão usada)

- Reduz riscos operacionais: limites mais folgados, projeto menos “pressionado” por teto, backups diários, mais espaço de DB (ordem de **8 GB** nesta referência), MAUs maiores, etc.
- *Overage* costuma ser incremental se estourar limites (raro no começo).

**Recomendação:** começar no **Free**. Avaliar **Pro** quando houver **8–10 players reais** e tráfego **consistente**, ou quando backups/PITR e SLAs forem requisitos explícitos.

---

## AWS self-hosted (detalhe)

- **Custo de lista** pode parecer competitivo; o **custo oculto** é tempo: provisionamento, monitoramento, patches, segurança, *scaling* de realtime.
- Ordem de grandeza de custos (referência maio/2026):
  - RDS **db.t4g.micro**: ~R$ 70–90/mês
  - EC2 pequeno para API: ~R$ 60–100/mês
  - mais S3, ElastiCache (Redis), CloudWatch, backups, etc.

Para **~20 players**, AWS **não compensa** como primeira escolha. Faz mais sentido quando houver **milhares** de usuários *concurrent*, necessidade forte de **controle total** (ex.: multi-tenant enterprise) ou **compliance** específico.

---

## Recomendação consolidada (Muziks)

1. **Hoje:** **Supabase Free** — melhor custo-benefício para validar hipótese com baixo risco financeiro.
2. **Após validação de tração** (ou exigência de backups mais confiáveis): **Supabase Pro** (~R$ 125–150/mês na referência acima).
3. **AWS (ou stack “bare metal + gerenciado”)** em **2027+** só se surgir, por exemplo:
   - **> 500–1.000** usuários *concurrent*; ou
   - pressão forte para **reduzir custo unitário** em escala grande; ou
   - **compliance** / residência de dados / integrações que o BaaS não atende na mesma forma.

Alinhar com a escolha de stack em [congelamento-mvp-e-arquitetura.md](congelamento-mvp-e-arquitetura.md) (**Next.js + Supabase** no MVP).

---

## POC em *free tier* (custo R$ 0): validar em **três contextos por hora**

**Objetivo:** rodar uma **prova de conceito** sem cartão, subindo front + backend leve, e **testar em ritmo intenso** — por exemplo **até três espaços ou “mesas” de teste na mesma hora** (três URLs de player, três QR, ou deslocamento físico bar → área externa → segundo ponto), com dezenas de pessoas no total. Esse padrão **não** esgota *free tiers* conhecidos, desde que não haja centenas de conexões *realtime* ociosas nem *egress* de vídeo.

**Custo mensal desta sessão de arquitetura:** **R$ 0** (apenas tempo de equipe).

### Hospedagem do frontend (opções a comparar — confirmar termos atuais)

**Decisão PoC:** deploy em **Vercel**; **DNS e borda já na Cloudflare** (proxy na frente do origin). Matriz completa de recursos CF (R2, Workers, Pages, etc.): [STACK-E-FASES-DE-MIGRACAO.md §1.4](../tech/STACK-E-FASES-DE-MIGRACAO.md).

| Opção | O que cobre bem na POC | Limite / ressalva (referência; validar no site) |
|--------|-------------------------|--------------------------------------------------|
| [**Vercel**](https://vercel.com/docs/plans/hobby) — plano **Hobby** | Next.js com zero config, *preview deployments*, edge leve — **host principal PoC** | **Uso comercial** (piloto em bar que cobra consumo, marca patrocinadora, etc.) **não** é permitido no Hobby; plano **Pro** ou outro host se o piloto for “de negócio”. Transferência rápida da ordem de **~100 GB/mês** no referencial público de documentação. |
| [**Cloudflare**](https://developers.cloudflare.com/) — **DNS + proxy** (Free) | CDN, SSL, DDoS na frente da Vercel; domínios já na CF | Não confundir com host: origin continua Vercel na PoC. Cache: cuidado em rotas dinâmicas de fila/voto. |
| [**Cloudflare Pages**](https://developers.cloudflare.com/pages/platform/limits/) | Sites estáticos + Next.js; bom *egress* no plano gratuito (~500 GB/mês ref.) | **Alternativa** ao deploy Vercel se bandwidth ou conta única CF priorizar; build limits e CPU por request — conferir ToS. |
| [**Netlify**](https://www.netlify.com/pricing/) | SPA/PWA, *serverless functions* | Quotas de build e *bandwidth* no *free*; verificar uso comercial no plano gratuito. |
| [**Render**](https://render.com/docs/free) | *Web service* gratuito (com *spin-down*) | Cold start; pode incomodar demo ao vivo se o serviço dormir. |
| **GitHub Pages** | Só **estático** (export estático do Next) | Sem API routes nativas no mesmo domínio sem truques; POC “só cliente” ok. |

**Recomendação pragmática:** para **POC puramente interna / amigos / sem fins de receita no deploy**, **Vercel Hobby + Supabase Free** é o caminho mais rápido. Para **piloto em estabelecimento comercial**, **não** contar com Hobby como destino final: migrar para **Vercel Pro**, **Cloudflare** ou **Netlify** conforme **termos** e orçamento (valores em USD × câmbio da secção de conversão).

### Backend e dados: **Supabase Free**

- Postgres + **Realtime** + (opcional) **Supabase Auth** no mesmo projeto — alinhado ao [congelamento](congelamento-mvp-e-arquitetura.md).
- Limites: ver secção **Supabase (detalhe)** acima; para três contextos/h e poucos dezenas de *concurrent*, **viável**.

### Auth adicional: **Firebase Authentication (plano Spark / gratuito)** — opcional na POC

**Intenção:** usar o ecossistema Google (**Firebase Auth**) para login social familiar, mantendo **dados de fila/voto** no Supabase.

| Aspeto | Viabilidade |
|--------|-------------|
| **Custo** | Spark é **gratuito** até cotas altas de MAU para fluxos padrão; **confirmar** [preços e quotas](https://firebase.google.com/pricing) vigentes (Identity Platform vs Auth “clássico” têm diferenças). |
| **SMS / telefone** | Envio de SMS para *sign-in* costuma exigir plano **Blaze** (faturado por uso) — na POC preferir **Google / Apple / e-mail link**. |
| **Integração com Supabase** | **Possível**, porém **não nativa**: o app autentica no Firebase, o servidor (Edge Function, *API route* ou serviço mínimo) **valida o JWT do Firebase** e grava/atualiza linhas no Postgres com **service role** ou usa **Custom JWT** se configurado. Há **dois painéis** e **dois fornecedores** de identidade para operar e documentar. |
| **Duplicação** | Se a POC **já** usa **Supabase Auth**, somar Firebase só faz sentido para **aprender** ou para **requisito** específico (ex.: certo fluxo Google); caso contrário, **simplificar: só Supabase Auth** na primeira POC. |

**Conclusão:** **Supabase Free sozinho** já cobre **auth + DB + realtime** para a POC; **Firebase Auth + Supabase** é **viável** com engenharia extra e **deve** ser validada contra limites Spark e contra **LGPD** (dois processadores, duas políticas de privacidade ou política unificada bem escrita).

### O que validar na POC (checklist curto)

- [ ] Simular **rajada**: ≥30 votos em menos de 2 min no mesmo player — sem 429 indevido para quem é legítimo, sem timeout no DB.
- [ ] Fila/telão estáveis com `queue.snapshot` e fallback polling validado.
- [ ] Pico *concurrent* por player (≤ 50–80 no ICP) sem erro de leitura.
- [ ] *Egress* do Supabase ao carregar capas/imagens (cache no cliente/CDN).
- [ ] Termos do host do **front** permitem o **tipo** de piloto (interno vs comercial).
- [ ] Se usar **Firebase + Supabase**: fluxo de *logout*, expiração de token e *mapping* estável `firebase_uid` → `participant_id` interno.
- [ ] Rotina de **backup** manual (dump ou *branch*) no *free* do Supabase, já que PITR é limitado.

---

## Receita e negócio (complemento)

Este arquivo cobre **custo de operação** (infra, *tiers*, POC). Para **modelos de receita**, *packaging*, OSS/freemium, personas (dev × dono de espaço) e expansão comercial/marketing, ver a pasta **[`../business/`](../business/README.md)** e o documento [01-receita-rentabilidade-e-go-to-market.md](../business/01-receita-rentabilidade-e-go-to-market.md).

---

## Artefatos opcionais (não incluídos aqui)

Podem ser adicionados nesta pasta ou em issues do repositório, conforme prioridade:

- Planilha de **cálculo detalhado** (sessões, votos, egress, MAU).
- **Configuração recomendada** do projeto Supabase (limites, *pools*, ambientes).
- **Checklist** de migração Free → Pro e, futuramente, Supabase → outra hospedagem (Postgres + auth + realtime).
