# Limites de uso e contingência do player

**Status:** referência operacional  
**Data da pesquisa:** 2026-05-25  
**Escopo:** crescimento do player Muziks em cima de Supabase, Vercel, Trigger.dev, Cloudflare e Spotify.

Este documento consolida limites públicos dos planos gratuitos/freemium e define uma política conservadora para operar o player antes de escalar infraestrutura. Os números abaixo devem ser revisados antes de cada piloto grande, porque os provedores mudam planos e quotas sem acoplamento ao ciclo de release do Muziks.

Documentos relacionados:

- [Arquitetura de playback Spotify](../mvp/06-arquitetura-playback-spotify.md)
- [Playback near-end e espelho da fila Spotify](./PLAYBACK-NEAR-END-AND-QUEUE-MIRROR.md)
- [Ambientes e URLs públicas](./AMBIENTES-E-URLS-PUBLICAS.md)
- [Stack e fases de migração](./STACK-E-FASES-DE-MIGRACAO.md)

---

## 1. Princípios de capacidade

1. O plano gratuito serve para desenvolvimento, PoC e pilotos pequenos. Produção comercial do player deve migrar para planos pagos antes de depender de disponibilidade contínua.
2. A fila pública não deve usar Realtime para todos os celulares no salão. A regra vigente continua: HTTP + polling de 3-5 s para fila/votos; Realtime fica restrito a baixa cardinalidade, como Player Master, telão e painel do dono.
3. Spotify é o gargalo de maior risco funcional. O player deve tratar `429` como sinal operacional normal, respeitar `Retry-After` e reduzir chamadas antes de tentar recuperar estado por força bruta.
4. Todo consumo não essencial deve ser desligável por feature flag ou configuração remota: analytics, dashboards, previews, jobs de enriquecimento, polling agressivo, imagens pesadas e eventos de presença.
5. Em incidente de quota, preservar primeiro a sessão ativa: áudio no Player Master, leitura mínima da fila, voto/dequeue essencial, token refresh e comandos do dono.

---

## 2. Limites oficiais pesquisados

### 2.1 Supabase Free

Fonte principal: [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [database size](https://supabase.com/docs/guides/platform/database-size), [Realtime limits](https://supabase.com/docs/guides/realtime/limits), [Realtime pricing](https://supabase.com/docs/guides/realtime/pricing), [bandwidth/egress](https://supabase.com/docs/guides/storage/serving/bandwidth).

| Recurso | Free publicado | Risco para o player |
| --- | --- | --- |
| Projetos grátis | 2 projetos por usuário owner/admin | Separar staging/prod em free fica apertado rapidamente. |
| Database size | 500 MB por projeto | Histórico de votos, eventos e logs de sessão pode levar o banco a read-only. |
| Storage size | 1 GB | Capas/cache próprio não devem depender de Storage no free. |
| Egress | Docs de billing citam 5 GB; docs de Storage citam 10 GB total, com 5 GB cached + 5 GB uncached | Tratar 5 GB como orçamento conservador até validar no dashboard. |
| MAU Auth | 50.000 MAU | Não é o gargalo inicial do player, pois participante pode ser anônimo/sessão curta. |
| Edge Function invocations | 500.000/mês | Evitar mover hot path do player para Edge Functions sem orçamento. |
| Realtime messages | 2 milhões/mês | Realtime não deve carregar fila pública com muitos participantes. |
| Realtime peak connections | 200 | Limita telões/masters/controles; público em massa via polling HTTP. |
| Realtime throughput | 100 mensagens/s, 100 joins/s, 20 presence msg/s | Presence e broadcast do público devem ser evitados no MVP. |
| Pausa por inatividade | Projetos Free com atividade muito baixa por 7 dias podem ser pausados | Não usar Free para ambiente que precisa disponibilidade sem intervenção. |
| Backups | Free não tem download de backups no dashboard | Antes de piloto real, criar rotina própria de export ou subir de plano. |

Observação operacional: se o Free exceder 500 MB de database size, o projeto pode entrar em modo read-only. A recuperação exige reduzir dados, executar vacuum quando aplicável e reabilitar read-write, ou migrar para Pro.

### 2.2 Vercel Hobby

Fonte principal: [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby), [Vercel limits](https://vercel.com/docs/limits), [Vercel pricing](https://vercel.com/pricing).

| Recurso | Hobby publicado | Risco para o player |
| --- | --- | --- |
| Uso permitido | Plano gratuito para projetos pessoais/não comerciais | Produção comercial do Muziks não deve depender do Hobby. |
| Fast Data Transfer | 100 GB/mês | Assets, app shell e polling público podem consumir tráfego. |
| Fast Origin Transfer | Até 10 GB/mês | SSR/API sem cache pode bater origem. |
| Edge Requests | Até 1.000.000/mês | Toda request conta, inclusive cache/static. |
| Function Invocations | 1.000.000/mês | API do player e webhooks devem ter cache, debounce e rate limit. |
| Function Duration | 100 GB-hours/mês | Handlers longos ou fan-out síncrono são risco. |
| Active CPU | 4 CPU-hours/mês | Compute intensivo no request path deve ser evitado. |
| Function max duration | 10 s default, configurável até 60 s | Não executar jobs ou reconciliações longas em request HTTP. |
| Deployments | 100/dia | CI/manual preview em excesso pode bloquear deploys. |
| Build execution | 6.000 min/mês | Monorepo com previews frequentes consome rápido. |
| Edge Config | 100.000 reads e 100 writes/mês | Bom para kill switches, mas não para telemetria de alta frequência. |
| Excedeu limite | Projetos podem pausar até reset de janela ou upgrade | Ter plano de fallback e upgrade antes de evento público. |

### 2.3 Trigger.dev Free

Fonte principal: [Trigger.dev pricing](https://trigger.dev/pricing), [Trigger.dev limits](https://trigger.dev/docs/limits).

| Recurso | Free publicado | Risco para o player |
| --- | --- | --- |
| Crédito mensal | US$ 5 de uso grátis/mês | Jobs de enriquecimento podem consumir orçamento silenciosamente. |
| Concorrência | Pricing atual cita 20 concurrent runs; docs de limites podem variar por dashboard | Usar dashboard `Limits` como fonte final antes de piloto. |
| API rate limit | 60 API requests/min no Free; pagos 1.500/min | Não usar Trigger para ações por voto/participante. |
| Schedules | 10 schedules | Suficiente para limpeza e reconciliação pequena. |
| Realtime Trigger | 10 conexões concorrentes | Não é canal de UX do player. |
| Log retention | 1 dia | Incidentes precisam ser investigados rápido ou enviados para outro log. |
| Query period | 1 dia | Métricas históricas não ficam disponíveis no Free. |
| Team members | 5 | Ok para fase inicial. |
| Batch trigger | Docs citam token bucket por plano; Free historicamente 1.200 runs de bucket e refill limitado | Usar batch para picos controlados, não para hot path. |

Diretriz: Trigger.dev deve executar apenas tarefas assíncronas não críticas para continuidade do áudio: limpeza, reconciliação tardia, relatórios, backfills e enriquecimento de metadados. Nunca colocar `track-ended`, `mirror-next` ou comando de dono dependendo de job externo.

### 2.4 Cloudflare Free

Fonte principal: [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

| Recurso | Free publicado | Risco para o player |
| --- | --- | --- |
| Workers requests | 100.000 requests/dia, reset 00:00 UTC | Bom para gateway leve; insuficiente para fan-out de muitos celulares sem cache. |
| Workers CPU | 10 ms CPU por invocação HTTP | Não colocar DB + Spotify + lógica pesada em Worker Free. |
| Memory | 128 MB | OK para roteamento leve. |
| Subrequests | 50 por invocação | Evitar cascatas de chamadas por request. |
| Workers KV reads | 100.000/dia | Cache simples e flags; não usar como contador quente por usuário. |
| Workers KV writes/deletes/list | 1.000/dia cada | Escrita de voto/sessão não deve ir para KV Free. |
| KV storage | 1 GB | Ok para config/cache pequeno. |
| D1 rows read | 5 milhões/dia | Pode servir cache/lookup pequeno, mas o domínio principal é Supabase Postgres. |
| D1 rows written | 100.000/dia | Não duplicar eventos de voto em D1 sem motivo. |
| D1 storage | 5 GB total | Não é fonte de verdade do MVP. |
| R2 storage | 10 GB-month/mês | Opção para assets/cache, com egress gratuito. |
| R2 ops | 1M Class A e 10M Class B/mês | Bom para arquivos; não para baixa latência de estado. |
| Erro de limite | Worker Free pode retornar Error 1027 ao exceder daily requests | Rotas críticas devem ter fallback fora do Worker. |

Diretriz: Cloudflare no Muziks é preferencialmente DNS/CDN/WAF e, se necessário, camada de proteção/cache. Não deve virar orquestrador principal do playback no Free.

### 2.5 Spotify Web API

Fonte principal: [Spotify rate limits](https://developer.spotify.com/documentation/web-api/concepts/rate-limits), [quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).

| Recurso | Limite publicado | Risco para o player |
| --- | --- | --- |
| Rate limit Web API | Janela móvel de 30 s; Spotify não publica número fixo | O orçamento real depende do app e do quota mode. |
| Erro de quota | HTTP `429` com `Retry-After` normalmente em segundos | Retry sem backoff derruba a sessão e piora o bloqueio. |
| Development mode | Até 5 usuários autenticados allowlisted; app owner precisa Premium | Serve para dev e beta mínimo, não para piloto aberto. |
| Extended quota mode | Usuários ilimitados e rate limit maior, mediante aprovação | Necessário para escala; processo pode levar semanas. |
| Requisitos novos | Desde 2025, pedido de quota extension apenas para organizações; critérios incluem negócio estabelecido e escala relevante | Planejar a conta Spotify Developer como ativo da empresa, não pessoal. |
| Endpoints com limite próprio | Alguns endpoints podem ter rate limit específico | Tratar `429` por endpoint, não só global. |

Orçamento interno recomendado para MVP-B antes de extended quota:

- `Get current playback`: no máximo 1 chamada a cada 5 s por Player Master ativo quando o SDK não entregar estado suficiente.
- `Add item to queue`: no máximo 1 tentativa por faixa candidata e por sessão, com idempotência no servidor.
- `Next/play/transfer`: somente por ação explícita do dono ou transição autoritativa; nunca por participante.
- `Search`: cache por termo normalizado e debounce mínimo de 400-800 ms no cliente; limitar resultados e paginação.
- Ao receber `429`: respeitar `Retry-After`, suspender chamadas não essenciais por sessão e reduzir polling Spotify para 15-30 s até estabilizar.

---

## 3. Limites internos do Muziks por fase

### 3.1 Free pilot

Uso indicado: desenvolvimento compartilhado, demo interna e piloto pequeno controlado.

| Dimensão | Limite interno | Motivo |
| --- | --- | --- |
| Sessões ativas simultâneas | 1-3 players | Evita multiplicar polling Spotify, Realtime e Postgres. |
| Participantes por sessão | Até 30-50 celulares | Compatível com polling 3-5 s sem fan-out WS. |
| Polling fila pública | 5 s normal; 10-30 s em degradação | Reduz Vercel/Supabase/Cloudflare requests. |
| Realtime por sessão | Master, telão e painel dono; evitar público | Preserva quota de 200 conexões Free Supabase. |
| Histórico de eventos | Retenção curta, agregação diária quando possível | Protege 500 MB do Postgres. |
| Jobs Trigger.dev | Apenas limpeza/reconciliação não crítica | Protege crédito Free e evita dependência operacional. |
| Imagens/capas | Usar URLs Spotify/externas com cache de metadata leve | Evita Storage/egress. |

### 3.2 Pilot pago mínimo

Uso indicado: bar/estabelecimento real com sessão aberta ao público.

Requisitos antes do evento:

- Supabase Pro ou plano equivalente para não pausar por inatividade, ter quota maior, suporte e backups.
- Vercel Pro para uso comercial, overages controláveis e menos risco de pausa.
- Spotify app em estratégia formal para quota: no mínimo revisão de Development Mode; para escala, iniciar Extended Quota com antecedência.
- Observabilidade mínima: dashboard de requests, erros `429`, uso de Realtime, database size, egress e function invocations.
- Feature flags de degradação aplicáveis sem deploy.

---

## 4. Priorização em desastre de uso

### 4.1 Nunca desligar primeiro

1. Player Master já autenticado e emitindo áudio.
2. Token refresh e cofre de credenciais do dono.
3. Leitura mínima da fila atual.
4. `track-ended`/dequeue autoritativo.
5. `mirror-next`/preload da próxima faixa, com backoff se Spotify limitar.
6. Painel do dono para pausar/retomar/encerrar sessão.
7. Segurança: RLS, validação de sessão, anti-spam básico.

### 4.2 Desligar em primeiro lugar

1. Analytics não essencial, funis, dashboards de produto e eventos detalhados.
2. Jobs de enriquecimento de metadados, relatórios, backfills e notificações.
3. Presence/realtime do público, indicadores "online agora" e animações ao vivo.
4. Search/autocomplete agressivo; manter busca manual com debounce/cache.
5. Imagens grandes, transformações, previews e assets não essenciais.
6. Staging/previews públicos e ambientes de demonstração.
7. Landing e rotas institucionais dinâmicas; manter página estática/cacheada.
8. Logs verbosos por request; manter amostra e erros.

### 4.3 Matriz de ação por sintoma

| Sintoma | Ação imediata | Recovery |
| --- | --- | --- |
| Spotify `429` | Respeitar `Retry-After`; congelar search/polling não essencial; permitir só comandos do dono e transições necessárias | Reativar por sessão quando 5 min sem `429`; revisar cache e orçamento de chamadas. |
| Supabase Realtime `too_many_connections` ou `tenant_events` | Desconectar público do Realtime; manter só Master/telão/dono; trocar estado visual por polling | Reativar Realtime apenas para baixa cardinalidade; revisar canais vazando. |
| Supabase database perto de 500 MB | Pausar gravação de analytics/eventos; compactar/agregar histórico; apagar dados descartáveis | Vacuum quando aplicável; considerar upgrade antes de reabrir gravação completa. |
| Supabase egress alto | Reduzir payloads da fila; remover campos pesados; cachear respostas públicas; cortar imagens via Supabase Storage | Medir endpoints mais caros e ajustar DTOs. |
| Vercel Edge Requests/Functions alto | Aumentar polling para 10-30 s; cachear GETs públicos; bloquear bots; pausar previews | Reabrir polling normal por sessão e manter proteção de cache/rate limit. |
| Vercel Function duration/CPU alto | Remover fan-out síncrono; jogar trabalho não crítico para fila/job; retornar resposta mínima | Revisar handlers lentos e queries. |
| Trigger.dev crédito/concorrência esgotado | Pausar jobs não críticos; cancelar backfills; manter limpeza essencial manual ou adiada | Reprocessar backlog em lotes pequenos fora do horário de pico. |
| Cloudflare Worker Error 1027 | Desviar rota crítica para Vercel/Supabase direto; desativar Worker não essencial | Reativar após reset diário ou migrar Worker crítico para plano pago. |
| Cloudflare KV write limit | Congelar escrita de métricas/flags voláteis; usar config estática ou Edge Config | Redesenhar contador quente fora de KV. |

---

## 5. Runbook de incidente

### Nível 0 — Normal

Condições:

- Uso abaixo de 60% dos limites mensais/diários relevantes.
- Sem `429` Spotify sustentado.
- Erros de API abaixo do limiar esperado.

Ações:

- Manter polling padrão.
- Registrar métricas agregadas.
- Revisar semanalmente database size, egress, function invocations e requests.

### Nível 1 — Atenção

Disparadores:

- 60-80% de qualquer quota crítica.
- Picos de `429` Spotify isolados.
- Aumento anormal de requests por participante.

Ações:

- Ativar debounce mais agressivo em busca e votos.
- Reduzir polling público para 8-10 s em sessões grandes.
- Pausar jobs Trigger.dev não urgentes.
- Validar se bots/previews/staging estão consumindo quota.

### Nível 2 — Degradação

Disparadores:

- 80-95% de quota crítica.
- `429` Spotify recorrente.
- Realtime recusando conexões ou Vercel perto de pause.

Ações:

- Ativar `PLAYER_DEGRADED_MODE`.
- Manter apenas operações críticas da sessão ativa.
- Fila pública passa para polling lento e payload mínimo.
- Desligar analytics detalhado, presence pública, enriquecimento e dashboards.
- Congelar criação de novas sessões se necessário.

### Nível 3 — Proteção de sobrevivência

Disparadores:

- Acima de 95% de quota.
- Supabase read-only, Vercel pause iminente, Cloudflare 1027 ou Spotify bloqueando fluxo principal.

Ações:

- Ativar `PLAYER_SURVIVAL_MODE`.
- Permitir somente sessões já ativas.
- Remover writes não essenciais.
- Preservar áudio, comandos do dono e dequeue mínimo.
- Se Spotify estiver limitando, não tentar reconciliar em loop; aguardar `Retry-After` e mostrar estado degradado.
- Comunicar operação manual: dono pode pausar/encerrar sessão pelo painel.

### Recovery

1. Confirmar qual quota estourou e em qual janela: mensal, diária, por minuto ou rolling 30 s.
2. Garantir que o modo degradado parou o crescimento do consumo.
3. Recuperar primeiro o write path essencial: sessão, fila, votos e comandos do dono.
4. Reativar Realtime restrito ao Master/telão/dono.
5. Reativar polling público em 10 s; voltar para 3-5 s apenas se o consumo ficar estável por 30 min.
6. Reprocessar jobs atrasados em lotes pequenos, fora do pico.
7. Fazer postmortem curto com causa, limite atingido, métrica ausente, feature desligada e ação preventiva.

---

## 6. Kill switches recomendados

Os nomes abaixo são sugestão de contrato para configuração remota, Edge Config, tabela `app_settings` ou variável server-side.

| Flag | Efeito esperado |
| --- | --- |
| `PLAYER_DEGRADED_MODE` | Reduz polling, payloads e chamadas externas não essenciais. |
| `PLAYER_SURVIVAL_MODE` | Bloqueia novas sessões e mantém apenas fluxo crítico de sessão ativa. |
| `DISABLE_PUBLIC_REALTIME` | Remove público de canais Realtime. |
| `DISABLE_DETAILED_ANALYTICS` | Mantém só contadores agregados e erros. |
| `DISABLE_METADATA_ENRICHMENT` | Pausa jobs de capa, artista, popularidade e relatórios. |
| `DISABLE_AUTOCOMPLETE` | Troca autocomplete por busca manual/debounce maior. |
| `SPOTIFY_BACKOFF_GLOBAL_UNTIL` | Suspende chamadas Spotify não críticas até timestamp definido. |
| `QUEUE_POLL_INTERVAL_SECONDS` | Controla intervalo de polling público por ambiente/sessão. |
| `MAX_ACTIVE_SESSIONS` | Limita novas sessões em crise. |
| `MAX_PARTICIPANTS_PER_SESSION` | Fecha entrada pública quando a sessão passa do teto operacional. |

---

## 7. Checklist antes de piloto com público

1. Confirmar no dashboard de cada provedor os limites reais do plano ativo.
2. Validar que Vercel Hobby não será usado para produção comercial.
3. Definir teto de sessões e participantes por sessão.
4. Ativar alertas para `429` Spotify, `Retry-After`, erros 5xx, database size, egress, Realtime connections e Vercel usage.
5. Testar manualmente `PLAYER_DEGRADED_MODE` e `PLAYER_SURVIVAL_MODE`.
6. Garantir que o dono consegue encerrar sessão mesmo com público em modo degradado.
7. Exportar ou proteger dados antes de evento real; Free Supabase não deve ser a única cópia de dados relevantes.
8. Registrar responsável operacional e janela de decisão para upgrade de plano.
