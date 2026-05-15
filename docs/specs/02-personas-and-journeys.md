# Personas e jornadas

## Personas

### P1 — Dono do player (dono do som)

**Objetivo:** curadoria sem microgerenciar cada pedido. Controla identidade sonora, horários e acordos do espaço.

**Necessidades:** política em camadas, calendário por dia da semana, revogação de acesso, visão da fila e dos votos, opcionalmente fichas para votar.

### P2 — Participante público

**Objetivo:** influenciar o que toca **de forma legítima** — sentir que o voto importa e que as regras são claras.

**Necessidades:** descoberta simples (link, QR, nome ou “estou aqui”), feedback humano quando algo não é permitido, votação clara na fila elegível.

### P3 — Operador de estabelecimento (pode coincidir com P1)

**Objetivo:** engajamento, possível receita em **fichas** (mecanismo de participação), operação estável em horário de pico.

**Necessidades:** configurar políticas por dia, comunicar como comprar/usar fichas, resolver conflitos com poucos passos (ex.: pausar votação, ajustar raio).

---

## Jornada A — Participante: entrar e votar

1. **Descoberta:** recebe link/QR ou busca nome do player; opcionalmente o app sugere players próximos via GPS ([05-discovery-and-access.md](05-discovery-and-access.md)).
2. **Contexto:** vê nome do espaço, regras resumidas (se houver) e estado da fila.
3. **Ação:** vota em uma ou mais faixas **já elegíveis** na fila; o sistema aplica ranking ([06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).
4. **Ficha (se ativo):** ao votar, consome saldo de fichas ou pede aquisição no estabelecimento — mensagem deixa claro que é **participação**, não “comprar música”.
5. **Bloqueio:** se tentar ação não permitida, recebe explicação cortês e, quando possível, alternativas ([07-ux-copy-and-states.md](07-ux-copy-and-states.md)).

**Critério de sucesso:** o participante entende **por que** algo aconteceu ou foi negado sem jargon técnico.

## Jornada B — Participante: sugerir / enfileirar faixa

1. Navega catálogo ou busca (a fonte do catálogo é decisão aberta — [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md)).
2. Seleciona faixa; o sistema avalia **política + dia da semana** ([04-rules-firewall.md](04-rules-firewall.md)).
3. Se **permitido**, a faixa entra na fila (ou em estado “pendente”, conforme modelo de domínio — [03-domain-model.md](03-domain-model.md)).
4. Se **negado**, mensagem amigável + sugestões (outro gênero, outro artista, outra faixa).

## Jornada C — Dono: configurar política

1. Define **modo de descoberta** (link, nome, GPS+raio) e limites de abuso mínimos ([05-discovery-and-access.md](05-discovery-and-access.md)).
2. Configura **camadas** gênero → artista → música (bloqueios e exceções) e **perfil por dia da semana** ([04-rules-firewall.md](04-rules-firewall.md)).
3. Ativa ou desativa **fichas para voto** e regras de consumo ([06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).
4. Monitora fila e votos; ajusta política em tempo real se necessário.

## Jornada D — Dono: reagir a incidente

1. Detecta abuso (spam de votos, participante fora do esperado).
2. **Revoga** link, reduz raio, pausa votação ou reforça política.
3. Comunicação ao público: estado claro na UI (“votação pausada pelo espaço”) sem expor dados sensíveis de terceiros.

---

## Momentos de verdade (produto)

- Primeiro **“não permitido”** — deve soar **justo e claro**, não punitivo.
- Primeiro **voto** que muda a ordem — deve parecer **imediato e transparente**.
- Primeira **instalação PWA** — deve reforçar confiança (nome, ícone, idioma) alinhado a [10-pwa-strategy.md](10-pwa-strategy.md).
