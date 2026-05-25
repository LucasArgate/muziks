# Identidade como fosso — participante, fila e voto

**Propósito:** fixar a direção de produto e segurança: **quem altera o estado coletivo** (vota, propõe faixa de forma vinculante à fila) precisa de **identidade verificável** (OAuth com provedor que entregue um sujeito estável), **sem** confundir isso com **login no Spotify ou Deezer** (catálogo/execução). Em paralelo, o sistema pode **persistir sinais secundários** para correlacionar **mesma origem** (anti-abuso, frequência de solicitações), com **LGPD** e transparência.

Este documento **não** defende muro de login na porta do bar. Defende **fosso no lugar certo**: depois que a pessoa **já sentiu valor**, **já entendeu o jogo** e **já viu por que o espaço precisa de confiança**.

**Dono do player (admin):** segue o que já está no pacote de MVP e nas specs — autenticação adequada a administrar player e política ([congelamento-mvp-e-arquitetura.md](congelamento-mvp-e-arquitetura.md), [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md)).

**Leitura obrigatória:** [06-queue-voting-and-chips.md](../specs/06-queue-voting-and-chips.md), [08-nfr-privacy-accessibility.md](../specs/08-nfr-privacy-accessibility.md), [05-discovery-and-access.md](../specs/05-discovery-and-access.md), [07-ux-copy-and-states.md](../specs/07-ux-copy-and-states.md), [12-telao-display-publico.md](../specs/12-telao-display-publico.md).

---

## 1. Princípio duplo: fosso onde importa, abertura onde inspira

### 1.1 O que identidade sustenta (inalterável)

| Necessidade | Por que identidade importa |
|-------------|----------------------------|
| **Integridade do voto** | Limite “1 pessoa / N votos por janela” exige **conta** verificável, não só cookie anônimo redefinível. |
| **Frequência de pedidos** | Evitar *spam* de propostas e *brigading* sem custo; o **compromisso** do login aparece **no momento em que o pedido deixa de ser só intenção** e passa a **pesar na fila dos outros**. |
| **Responsabilização leve** | Incidentes precisam de **trilha mínima** alinhada a políticas do espaço e à lei — sem transformar o Muziks em rede social. |

### 1.2 O que a identidade **não** deve bloquear (mudança de matriz)

**Fosso** não é “tela de login antes de qualquer coisa”. É **barreira proporcional** entre **espetáculo / exploração** (baixo risco, alto valor emocional) e **ato público na fila** (risco coletivo, precisa de sujeito).

- Concorrentes que pedem cadastro antes de mostrar **uma linha de fila** confundem **segurança** com **preguiça de desenho**. O resultado é deserto: ninguém descobre o produto no contexto real do bar, da festa ou do *after*.
- O Muziks deve permitir **adesão orgânica**: a pessoa **vê** o que está acontecendo, **entende** a dinâmica do espaço, **brinca** mentalmente com “o que eu pediria” — e só então **atravessa o portão** quando for **justo** pedir confiança.

---

## 2. Regra de ouro da fricção: **valor → por quê → dados**

Trata-se de uma **sequência cognitiva**, não de um único modal agressivo.

### 2.1 Valor primeiro (superfície pública convidativa)

Antes de qualquer identidade forte, o participante deve poder **viver o lado público** do player:

- **Estado público legítimo:** fila visível (ordem, faixas **já aceitas** pela política, posição aproximada na corrida de votos quando isso for dado público por desenho do dono), sensação de “o espaço está vivo”, possivelmente alinhado ao **telão** ou à mesma fonte de verdade ([12-telao-display-publico.md](../specs/12-telao-display-publico.md)).
- **Exploração lúdica:** buscar música que gosta, percorrer resultados, **antecipar** o pedido — aqui o produto pode ser **fofinho e convidativo**: botão **(+)** grande, amigável, fácil de mirar numa mesa com copo na mão; microinterações que dizem “você pode participar” **sem** ainda dizer “entregue sua alma ao OAuth”.
- **Motivação intrínseca:** o usuário precisa sentir: *eu quero estar nessa história*. Esse desejo é o **combustível** que faz a próxima etapa (identificar-se) parecer **razoável**, não burocrática.

**Limite de segurança:** o que for “público” **não** inclui dados pessoais de terceiros (quem votou em quem com nome, histórico de IP, etc.). O público é **sobre música e ordem**, não sobre vigilância social.

### 2.2 Por quê, em linguagem humana (antes do provedor)

No instante em que o toque no **(+)** ou em “votar” **vai** gerar efeito coletivo, o fluxo deve **parar** numa **explicação curta e honesta** — ainda **antes** da tela de Google / Apple / Meta:

- **Por que pedimos identidade:** “cada voto conta de verdade”, “o espaço precisa saber que não é a mesma pessoa votando cinquenta vezes”, “assim a fila fica justa para todo mundo que está aqui”.
- **O que não estamos pedindo:** deixar claro que **não** é obrigação de ter Spotify/Deezer; que o login é **só para participar com responsabilidade**, não para “vender seus gostos musicais” em tom predatório.
- **Tom:** alinhado a [07-ux-copy-and-states.md](../specs/07-ux-copy-and-states.md) — uma frase principal, ação clara, zero culpar o usuário por existir política no espaço.

Essa etapa é o **cola** entre curiosidade e compromisso: sem ela, o OAuth parece **teleporte** para um formulário de governo; com ela, parece **contrato social mínimo** que qualquer pessoa num bar consegue entender.

### 2.3 Só então os dados (OAuth e política de privacidade)

Depois da explicação, sim: **provedor de identidade** + link para política. A ordem **valor → por quê → dados** é a **regra de ouro** para **fricção que adere**: a fricção aparece **no último momento possível**, no **menor escopo possível**, para o **maior benefício coletivo** claramente comunicado.

**Anti-padrões** a evitar:

- Login antes de ver fila ou antes de tocar no **(+)** em modo “só explorar”.
- Texto jurídico denso **antes** da frase humana do “por quê”.
- Tratar “identidade amigável” como sinônimo de “menos seguro”: amigável é **clareza e timing**, não **buraco** na integridade do voto.

---

## 3. Onde passa a ser normativo: fronteira entre “ver” e “comprometer”

**Normativo (direção MVP+):**

- **Visualização e busca** no contexto público do player podem existir **sem** autenticação forte, desde que **não** violem privacidade nem exponham vetores de enumeração abusiva (detalhes de endurecimento em [11](../specs/11-backend-and-integrations-open.md) e [05-discovery](../specs/05-discovery-and-access.md)).
- Para **ações que alteram estado coletivo** — registrar voto que conta, **enviar proposta** que entra na lógica de fila como pedido vinculante, ou outras mutações equivalentes definidas na implementação — o usuário **deve** estar autenticado com **pelo menos um** login que forneça **identidade estável** gerida por terceiro de confiança **após** o fluxo da secção 2.
- **Exemplos de IdPs desejáveis:** **Google**, **Apple** (forte em iOS), **Meta** (**Facebook** / fluxos unificados Meta **conforme o stack de auth suportar**). A escolha exata de botões é **produto + jurídico + disponibilidade** no Supabase Auth / NextAuth / Clerk, etc.
- **Não** exigir **Spotify nem Deezer** só para **pedir música** ou **votar**: o participante pode nunca ter conta de streaming; o dono ancora execução no modelo já descrito ([03-viabilidade-integracao-spotify-eda.md](03-viabilidade-integracao-spotify-eda.md)).
- **Opcional futuro:** vincular conta de streaming **além** do IdP — sempre **depois** do núcleo de participação, nunca como **paredão inicial**.

> **Nota “Instagram”:** login social costuma ser exposto como **Google / Apple / Facebook (Meta)**. “Instagram” como provedor OAuth de primeiro nível nem sempre está disponível da mesma forma; unificar sob **Meta** quando fizer sentido e for suportado pelo provedor de auth escolhido.

---

## 4. Sinais secundários: mesma origem sem substituir o IdP

Objetivo: **detectar padrões** (várias contas no mesmo dispositivo, mesma rede, *burst* coordenado), **não** substituir o login legalmente claro. Na fase **pré-identidade**, sinais leves podem servir só para **rate limit** grosseiro e proteção da API; **depois** do login, combinam-se com `sub` para políticas de frequência.

| Sinal | Uso típico | Cuidado (LGPD / ética) |
|-------|------------|-------------------------|
| **Endereço IP** (ou prefixo) | *Rate limit*, risco, correlação fraca em CGNAT | Não tratar IP como pessoa; retenção curta; transparência na política |
| **Identificador de instalação / dispositivo** (ex.: UUID gerado no app na primeira instalação, armazenado em storage privado) | Limite por aparelho além da conta | Minimizar; permitir reset com consentimento; documentar finalidade |
| **User-Agent / tipo de cliente** | Heurística grosseira, suporte | Não usar como única prova de identidade |
| **Hora e padrão de uso** | *Anomaly detection* interno | Agregar; evitar vigilância invasiva |
| **Hash de conta de IdP** (sub + issuer) | Chave canónica de voto | Já é o núcleo; armazenar só o necessário |

**Evitar** como padrão do produto: *fingerprinting* agressivo de browser sem base legal clara e sem alternativa; cruzamento com dados de terceiros não autorizados.

**Direção:** combinar **sub do OAuth** (fonte de verdade para “quem”) com **camada de risco** (IP + device id + limites) para “quantas vezes” e “quão suspeito”, sempre revisável em [08](../specs/08-nfr-privacy-accessibility.md) com jurídico.

---

## 5. Dono do player: sem mudança de fundamento

- Continua com **autenticação de administrador** adequada a criar player, política, links, telão e moderação — conforme [congelamento-mvp-e-arquitetura.md](congelamento-mvp-e-arquitetura.md) e decisões em [11](../specs/11-backend-and-integrations-open.md).
- **Separação clara de papéis:** identidade do **dono** (controle do espaço) ≠ identidade do **participante** (voz na fila); permissões e dados **não** devem vazar entre esses contextos sem necessidade.

---

## 6. Encaixe técnico (referência, não implementação)

- **Leitura pública vs escrita autenticada:** separar rotas ou canais realtime “**espectador**” (snapshot de fila, metadados públicos) de mutações “**participante autenticado**”; o portão da secção 2 vive na borda entre elas.
- **Supabase Auth / NextAuth / Clerk:** múltiplos provedores OAuth; mapear para `user_id` interno e **roles** (`owner` | `participant`).
- **Votos e fila:** chave estrangeira para participante autenticado nas mutações; limites por `user_id` e, secundariamente, por `device_installation_id` + janela temporal.
- **Eventos (EDA):** `ParticipantAuthenticated`, `VoteRejectedRateLimit`, `SuspiciousClusterDetected` (interno, sem expor ao público detalhes que violem privacidade).

---

## 7. Próximos passos de documentação

Quando fechar lista exata de IdPs, política de retenção de IP/device e **copy** do passo “por quê”, **atualizar** [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md) (secção 2), [08-nfr-privacy-accessibility.md](../specs/08-nfr-privacy-accessibility.md) e exemplos em [07-ux-copy-and-states.md](../specs/07-ux-copy-and-states.md); este arquivo permanece como **arquitetura de produto** do pacote MVP.

---

## 8. Exceção PoC — Spotify como IdP do participante (`apps/web`)

**Status:** válida **somente** na PoC do client participante em `muziks.app`, até adoção de Muziks IdP (Google / Apple / Meta) na superfície pública.

| Aspecto | Regra PoC |
|---------|-----------|
| **Objetivo** | Identificar quem vota com `spotify_user_id` estável via OAuth; **sem** playback nem menção a Premium no web participante. |
| **Escopos** | Mínimos (ex.: `user-read-email`); **não** gravar `spotify_connections` de playback no fluxo participante. |
| **Separação** | Login Spotify do **dono** permanece em `player.muziks.app` com scopes de execução; cookies/state PKCE distintos do participante. |
| **Copy** | Portão **valor → por quê → dados** inalterado; o botão pode ser “Continuar com Spotify” em vez de Google/Apple. |
| **Futuro** | Muziks OAuth como IdP principal; Spotify opcional para vincular gostos; **links de afiliados** para criação de conta Spotify fora do escopo desta PoC (produto/compliance). |

Esta exceção **não** altera a regra de que o participante **não** precisa de conta de streaming para **ver** fila e **explorar** busca; só para **votar** ou mutação equivalente.
