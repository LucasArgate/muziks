# Requisitos não funcionais, privacidade e acessibilidade

## Performance e confiabilidade

- **Mobile-first:** interações críticas (votar, ver fila) devem responder em tempo percebido **curto** em 3G razoável; valores numéricos ficam para benchmarking na implementação.
- **Resiliência:** falhas de rede não devem corromper estado local sem possibilidade de recuperação (retry, fila de ações — ver [10-pwa-strategy.md](10-pwa-strategy.md)).

## PWA e offline

- O shell da aplicação deve carregar **consistentemente** quando instalado como PWA.
- **Offline:** degradação elegante — ver [10-pwa-strategy.md](10-pwa-strategy.md) para o que é obrigatório vs desejável.

## Acessibilidade (mínimo)

- Navegação por teclado nos controles principais.
- Nomes acessíveis em botões de voto e estados da fila.
- Anúncios de mudança significativa de ordem (quando a plataforma permitir sem poluição sonora).

## Privacidade e LGPD (nível de requisitos)

> Texto jurídico final (bases legais, DPIA, políticas públicas) **não** substitui esta spec; esta spec lista **exigências de produto/dados** para o time jurídico completar.

**Dados sensíveis típicos:**

- **Geolocalização** — coletar só com **consentimento** explícito; finalidade: descoberta de players e validação de raio; **minimização** (precisão e retenção limitadas).
- **Identificadores de sessão** — para anti-abuso e continuidade de voto; retenção definida com jurídico.

**Requisitos normativos de produto:**

- Tela ou fluxo de **transparência** (o que é coletado e por quê) antes ou no momento adequado de consentimento.
- **Revogação** de consentimento de geo deve degradar para modos link/slug sem punir o usuário.
- **Exportação / exclusão** conforme obrigações legais aplicáveis — detalhes operacionais abertos em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md).

## Segurança

- Comunicação **HTTPS** em produção.
- **Sem** exposição de chaves secretas no cliente.
- Proteções de API (auth, rate limit) — [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md).
