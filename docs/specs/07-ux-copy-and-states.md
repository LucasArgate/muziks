# UX: estados e copy

## Princípios de tom de voz

- **Humano e respeitoso:** nunca culpar o participante por regras do espaço.
- **Claro:** uma frase principal + ação sugerida.
- **Honesto em erros:** falha técnica ≠ “você errou”.
- **Sem jargon:** evitar códigos internos na superfície primária.

## Estados de interface (catálogo mínimo)

| Estado | Descrição | Comportamento esperado |
|--------|-----------|-------------------------|
| Espectador (público) | Vê fila/estado público do player sem login | Fila e dados não sensíveis; convite claro a participar; **(+)** e busca acessíveis até o portão de compromisso ([../mvp/05-identidade-fosso-participante-voto.md](../mvp/05-identidade-fosso-participante-voto.md)). |
| Antes de identificar (portão) | Toque em votar/enviar proposta exige login | **Primeiro** explicar em linguagem humana **por quê** a identidade; **depois** OAuth + política; sem culpar o usuário. |
| Carregando player | Busca política/fila | Skeleton ou spinner; não flicker agressivo. |
| Player pausado | Dono pausou participação | Mensagem neutra; sem dados de outros usuários. |
| Acesso revogado | Link/slug inválido ou expirado | Explicar que o espaço encerrou este acesso; oferecer busca se existir. |
| Geo negada | Permissão do browser negada | Explicar que GPS é opcional; oferecer entrada por link/slug. |
| Fora do raio | GPS ok mas fora do raio | Mensagem amigável; não mostrar distância com precisão invasiva se não necessário. |
| Música bloqueada | Política negou proposta | Motivo em linguagem natural + atalho para “ver permitidos” se existir. |
| Fila vazia | Sem itens | Convidar à primeira proposta ou mostrar dicas do espaço. |
| Sem fichas | Economia de fichas ativa | Explicar que fichas são do **estabelecimento** para **votar**; onde conseguir (balcão). |
| Erro de rede | Offline / timeout | Retry claro; preservar rascunho local se aplicável ([10-pwa-strategy.md](10-pwa-strategy.md)). |
| Conflito / voto duplicado | Regra de negócio | Mensagem curta, sem acusar trapaça. |

## Exemplos de mensagens (não normativas — orientação)

- Bloqueio por política: “Este espaço não aceita este estilo hoje. Quer ver o que está liberado?”
- Fora do raio: “Parece que você ainda não está na área deste player. Peça o link na recepção ou aproxime-se.”
- Sem geo: “Podemos usar sua localização para achar players perto de você. Se preferir não, use o link ou o nome do espaço.”

## Acessibilidade

Contraste, foco visível, labels em controles de voto e leitores de tela para mudanças de ordem na fila — ver [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md).
