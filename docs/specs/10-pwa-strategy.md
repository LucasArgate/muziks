# Estratégia PWA

## Objetivo

Usar PWA para **aderência** e **tração**: instalação opcional, experiência próxima à de app, atualizações previsíveis.

## Baseline do repositório (Vite + vite-plugin-pwa)

O projeto usa `vite-plugin-pwa` no `vite.config.ts` com, entre outros:

- **`registerType: "autoUpdate"`** — o service worker atualiza quando há nova versão; a UI deve tolerar **refresh** após deploy sem surpresa ruim para quem está votando (mensagem suave ou recuperação de estado via servidor).
- **Manifest Web App** — `name` / `short_name` “Muziks”, `lang: "pt-BR"`, `display: "standalone"`, `start_url: "/"`, cores de tema alinhadas ao branding escuro do manifesto PWA.
- **Workbox** — padrão de cache de assets estáticos (`js`, `css`, `html`, ícones, fontes); **não** assumir cache agressivo de **dados dinâmicos** de fila/voto sem estratégia explícita na implementação.

> Ao alterar o `vite.config.ts`, atualizar **este documento** para manter paridade entre código e spec.

## Requisitos de produto

1. **Instalável:** o usuário pode adicionar à tela inicial; o fluxo não deve ser intrusivo (banner discreto ou entrada pelas opções do browser).
2. **Identidade:** ícone e nome coerentes com o Muziks; tema visível na barra de status quando suportado.
3. **Atualização:** após deploy, o usuário deve obter nova versão **sem** passos manuais complexos; se houver risco de perda de ação local, preferir **reconciliação** com o backend.
4. **Offline:**
   - **Mínimo:** shell, assets e mensagem clara quando API indisponível ([07-ux-copy-and-states.md](07-ux-copy-and-states.md)).
   - **Desejável:** fila em leitura stale com marcação “pode estar desatualizado” + retry.
   - **Não obrigatório no MVP:** reprodução de áudio offline completa (depende de integrações em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md)).

## Limitações de plataforma (awareness)

- **iOS Safari:** comportamento de PWA, background e APIs de mídia/geo podem ser mais restritivos; features críticas devem degradar com mensagens claras.
- **Android Chrome:** geralmente melhor suporte a instalação e notificações (se usadas no futuro).

## Privacidade

Service worker e cache local podem reter **respostas recentes**; política de dados em [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md).
