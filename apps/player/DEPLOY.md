# Deploy — @muziks/player (master Spotify)

## Vercel

| Campo | Valor |
|-------|-------|
| Nome do projeto | `muziks-player` |
| Root Directory | `apps/player` |
| Framework | Next.js |
| Production branch | `main` ou `staging` (conforme GitFlow) |

`vercel.json` nesta pasta define install/build do monorepo.

**Turborepo:** secrets como `SUPABASE_SERVICE_ROLE_KEY` e `DATABASE_URL` precisam estar declarados em `turbo.json` (`globalEnv` / `build.env`) — senão a Vercel não repassa essas variáveis ao `pnpm turbo run build` e o passo *Collecting page data* falha.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Service role (callback cria sessão/auth user) |
| `DATABASE_URL` | Sim | **Transaction pooler** do Dashboard (ver abaixo) |
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` | Sim | Client ID do app no Spotify Dashboard |
| `NEXT_PUBLIC_PLAYER_APP_URL` | Sim | URL pública (ex.: `https://player.muziks.app`) |
| `NEXT_PUBLIC_WEB_APP_URL` | Sim | URL do web participante — botão "Compartilhar fila" |
| `SPOTIFY_CLIENT_SECRET` | Sim | OAuth + assinatura do `state` PKCE |
| `SPOTIFY_TOKEN_ENCRYPTION_KEY` | Recomendada | Cifra refresh em `spotify_connections` |

#### `DATABASE_URL` (erro `tenant/user … not found`)

Copie em **Supabase → Settings → Database → Connection string → URI → Transaction pooler** (porta **6543**). Não reutilize host `aws-0-…` de outro ambiente: o subdomínio do pooler muda (`aws-0`, `aws-1`, …).

Formato esperado:

```txt
postgresql://postgres.SEU_PROJECT_REF:SENHA@aws-N-REGIAO.pooler.supabase.com:6543/postgres
```

- Usuário: `postgres.SEU_PROJECT_REF` (não só `postgres`)
- Host: o que o Dashboard mostra hoje para o projeto
- Cole o mesmo valor em **Vercel → muziks-player → Settings → Environment Variables** (Production)

Se 6543 falhar no projeto, teste **Session pooler** (porta **5432**) com a URI correspondente do Dashboard.

#### Migrations (obrigatório antes do primeiro login)

O banco Supabase de produção precisa das tabelas `profiles`, `players`, `spotify_connections`. Na raiz do monorepo, com `DATABASE_URL` apontando para produção:

```bash
pnpm db:migrate
```

Sem isso o callback Spotify falha após autorizar.

No Spotify Dashboard, registrar redirect URI:

- Produção: `https://player.muziks.app/api/spotify/callback`
- Staging: `https://staging-player.muziks.app/api/spotify/callback`
- Local: `http://127.0.0.1:3002/api/spotify/callback` (não usar `localhost`)

Ver [Building with AI (Spotify)](https://developer.spotify.com/documentation/web-api/tutorials/building-with-ai).

### Staging vs produção (Vercel)

O OAuth usa `NEXT_PUBLIC_PLAYER_APP_URL` para montar redirects. **Cada ambiente na Vercel precisa da sua própria URL** — não copie a de produção para Preview/Staging.

| Escopo Vercel | Domínio player | `NEXT_PUBLIC_PLAYER_APP_URL` | `NEXT_PUBLIC_WEB_APP_URL` |
|---------------|----------------|------------------------------|----------------------------|
| **Production** | `player.muziks.app` | `https://player.muziks.app` | `https://muziks.app` |
| **Preview** (branch `develop`, etc.) | `staging-player.muziks.app` | `https://staging-player.muziks.app` | `https://staging.muziks.app` |

Se staging ainda redirecionar para produção, confira no projeto Vercel → Settings → Environment Variables que Preview não herda o valor de Production.

Opcional: `PLAYER_ALLOWED_APP_ORIGINS=https://staging-player.muziks.app` no ambiente Preview (fallback se a URL da requisição for permitida explicitamente).

No **Supabase → Authentication → URL Configuration**, incluir em redirect URLs: `https://staging-player.muziks.app/**` e `https://player.muziks.app/**`.

## Domínios

- **Produção:** `player.muziks.app`
- **Staging:** `staging-player.muziks.app`

## Cloudflare

- CNAME para o projeto Vercel
- SSL/TLS: **Full (strict)**
