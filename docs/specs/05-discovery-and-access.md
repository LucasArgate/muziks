# Descoberta e acesso ao player

## Modos de descoberta (requisitos de produto)

O participante deve poder encontrar ou entrar no player por:

1. **Nome único / slug** — identidade estável digitável ou buscável.
2. **Link profundo + QR Code** — o QR codifica o mesmo URL; facilita mesa, flyer, Uber, chácara.
3. **Geolocalização (lat, lng) + raio** — lista ou destaque de players **dentro** do raio configurado pelo dono.

Cada modo pode coexistir; o dono escolhe o que **habilita** por player.

## Contexto de adoção do QR Code

QR Code é tratado como canal principal de acesso explícito porque a barreira comportamental observada na primeira geração do produto diminuiu: leitura pela câmera tornou-se comum, especialmente após cardápios digitais, pagamentos e check-ins em ambientes físicos. Ainda assim, o produto **não deve depender exclusivamente** de familiaridade com QR.

Requisitos práticos para QR:

- O QR deve codificar uma URL legível e compartilhável; a mesma entrada deve funcionar como **link profundo**.
- Materiais públicos devem mostrar também **slug, nome ou URL curta** quando o contexto permitir, para quem prefere digitar ou não consegue escanear.
- A copy deve explicar o benefício imediato do gesto (“entrar na fila”, “votar”, “ver o que toca”), não apenas exibir um código.
- O fluxo não deve exigir instalação de app nativo para a ação básica do participante.

## Requisitos funcionais

- **R1:** Com link válido, o participante acessa o contexto do player sem passos desnecessários.
- **R2:** Com slug, o fluxo de busca deve tolerar **erro de digitação** razoável quando tecnicamente viável (sugestão, não obrigatório no MVP).
- **R3:** Com GPS, o app deve pedir **permissão explícita** de geolocalização e funcionar **degradado** se negada (ex.: usar apenas link/slug) — detalhes de copy em [07-ux-copy-and-states.md](07-ux-copy-and-states.md).
- **R4:** O dono deve poder **revogar** ou **rotacionar** links e ajustar **raio** sem “quebrar” o player para quem já tem bookmark (mensagem clara de “acesso encerrado” vs “player pausado”).

## Segurança e abuso (princípio 8 do manifesto)

**Riscos:** stalking via mapa, enumeração de slugs, spam de participantes remotos fingindo proximidade.

**Mitigações de produto (conceituais):**

- Raio **mínimo e máximo** sugeridos por tipo de espaço (valores numéricos: decisão de implementação).
- **Não** expor precisão excessiva da posição de outros usuários.
- **Rate limit** em votos e propostas por sessão/IP/conta (detalhe em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md)).
- **Revogação rápida** de canais públicos em incidentes (jornada D em [02-personas-and-journeys.md](02-personas-and-journeys.md)).

## Privacidade

Coleta e retenção de localização devem seguir [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md) e bases legais aprovadas pelo negócio.

## Telão (display público)

Especificação completa do **modo telão** — representação visual no espaço, fotos, QR e habilitação por contexto — em **[12-telao-display-publico.md](12-telao-display-publico.md)**.

## Fora de escopo

- Mapa estilo “Pokemon Go” de todos os players do mundo.
- Precisão de indoor (BLE) — futuro opcional para **descoberta** do player (proximidade ao estabelecimento).

**Nota (ortogonal):** [Hub local WebRTC](../disruption/hub-local-webrtc-e-fanout.md) trata de **sincronizar leitura da fila** entre dispositivos já no mesmo player (fan-out na LAN), não de descoberta por BLE nem de substituir slug/link/QR.
