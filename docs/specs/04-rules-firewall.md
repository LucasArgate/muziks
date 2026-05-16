# Regras: firewall de som

## Objetivo

Garantir que **toda escolha pública** seja avaliada contra a **política do dono**, em camadas do amplo ao específico — metáfora de **firewall**: ordem importa; bloqueio superior **corta** o que está abaixo.

## Dimensões

1. **Gênero** — piso ou teto amplo.
2. **Artista** — refinamento dentro do universo de gêneros permitidos (ou exceções explícitas).
3. **Música (faixa)** — controle fino por título/ID; **preferencialmente por ISRC** quando o catálogo expuser *International Standard Recording Code*, para mesma regra valer em qualquer fornecedor ([03-domain-model.md](03-domain-model.md), [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md)).

Além das camadas:

4. **Dia da semana** — o mesmo player pode aplicar **conjuntos de regra diferentes** por dia (ex.: sexta vs terça), alinhado ao [Manifesto](../MANIFESTO.md).

## Semântica normativa (composição)

- A avaliação de uma **proposta de faixa** deve considerar: **dia vigente** → **gênero** → **artista** → **faixa**, com regras explícitas de **permitido** e **negado** em cada nível aplicável.
- **Bloqueio em nível superior:** se o gênero da faixa está **bloqueado** para aquele dia, a faixa é **negada** sem necessidade de avaliar artista/faixa (a UI ainda pode explicar de forma humana qual regra “ganhou”).
- **Exceções:** o dono pode modelar **lista de exceções** (ex.: artista permitido num gênero majoritariamente bloqueado) desde que isso **não contradiga** uma regra superior explícita de “negar tudo deste gênero” — o produto deve escolher uma **precedência documentada na implementação**; até lá, a regra de ouro é: **previsibilidade** (o dono entende o resultado antes do público).

## Estados de decisão

| Resultado | Significado para o participante |
|-----------|----------------------------------|
| Permitido | Faixa pode entrar na fila (ou no estado “elegível” acordado). |
| Negado | Faixa não entra; mensagem **cortês** com motivo em linguagem natural ([07-ux-copy-and-states.md](07-ux-copy-and-states.md)). |
| Indeterminado (erro) | Falha técnica ou catálogo incompleto; mensagem honesta, sem culpar o usuário. |

## Exemplos (ilustrativos)

| Dia | Regra de gênero | Regra de artista | Faixa | Resultado esperado |
|-----|-----------------|------------------|-------|----------------------|
| Sexta | Permite eletrônico | Bloqueia artista X | Faixa de X | Negado (artista) |
| Terça | Bloqueia funk | Permite artista Y (exceção?) | Funk de Y | Depende da precedência de exceção — **deve** ser consistente após implementação; default sugerido: **gênero bloqueado nega** salvo “exceção explícita de faixa” cadastrada pelo dono. |
| Qualquer | Permite tudo cadastrado | — | Faixa sem metadado de gênero | Indeterminado até catálogo corrigido ou política default “negar sem metadado” (decisão em [11](11-backend-and-integrations-open.md)). |

## Alinhamento com UX

- Nunca exibir **código interno** como resposta primária (“ERR_POLICY_3”).
- Preferir **uma frase curta** + **o que pode fazer a seguir** (ex.: “Este espaço não aceita este estilo hoje (terça). Quer ver o que está liberado?”).

## Evolução (hipótese — fora do MVP)

Camada **opcional** de **curadoria com agentes**: após passar nas regras estáticas, um agente pode julgar pedidos **inusitados** com base no *mood* da fila e na **essência do espaço** configurada pelo dono — sem substituir bloqueios duros nem o veto do dono. Racional, riscos e desenho em [firewall-curador-com-agentes.md](../disruption/firewall-curador-com-agentes.md).

## Fora desta spec

- Motor de inferência de gênero a partir de áudio — não é requisito.
- Negociação automática com direitos autorais — [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md); fronteiras de produto e licenciamento — [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md).
