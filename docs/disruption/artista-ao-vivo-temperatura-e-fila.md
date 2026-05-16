# Artista ao vivo: temperatura do público e fila

**Estado:** hipótese de produto e disrupção reconhecida — texto de **intenção e contexto**; o comportamento normativo (requisitos fechados) ainda **não** está consolidado numa spec em `docs/specs/`. O mapa geral liga esta nota em [mapa-dores-e-solucoes.md](./mapa-dores-e-solucoes.md).

---

## Contexto

Em espaços com **música ao vivo**, o som “oficial” deixa de ser só fila gravada: há um **intérprete no palco** que improvisa repertório, pedidos e energia da sala. O Muziks, como player democrático com política e fila visível, pode coexistir com esse contexto — mas só se **ligar** o que o público já expressa no produto (pedidos, votos, universo permitido) ao que o artista precisa para **decidir** sem ruído nem disputa de controlo.

---

## Dor (abstração)

1. **Palco cego à temperatura:** o cantor ou banda não tem, de forma rápida e legível, um retrato do que o público **já mostrou** que quer — agregados por gênero e artista (e, quando fizer sentido, sinais da fila elegível), dentro das regras do espaço.
2. **Fila digital e show desalinhados:** o evento ao vivo tem **início, fim e ritmo próprios**; os dados úteis para o artista são os da **janela do show**, não necessariamente o histórico inteiro do bar.
3. **Pedidos opacos ou inseguros:** gritos, bilhetes e DMs não escalam; abrir o **mesmo** controlo da fila ao telefone do artista reproduz o padrão “muitas mãos, um só som” e fragiliza confiança.
4. **Participação sem canal claro:** quando o modo ao vivo está desligado, o público influencia a **fila gravada**; quando está ligado, faz sentido um canal explícito de **pedido dirigido ao artista** (sempre sujeito à política do dono e ao que o show comporta).

---

## Solução (direção Muziks)

Completar a experiência **do artista ao vivo** com um **modo apresentação** controlado pelo dono do espaço:

| Elemento | Papel |
|----------|--------|
| **Janela temporal** | No dia (ou momento) do show, o dono define **quando** a apresentação conta para o produto; o sistema **filtra e cruza** comportamento da fila/votos **nessa janela** para alimentar resumos ao artista (antes, durante e depois — conforme política de retenção a definir na spec). |
| **Temperatura** | Entregar ao intérprete listas/resumos **prontos** (ex.: gêneros e artistas mais pedidos ou votados **no universo permitido**), para ler o clima da sala sem folhear a fila técnica inteira. |
| **Convite seguro** | O dono convida o artista por **link ou QR** a uma **visualização estática ou só-leitura** da fila / pedidos relevantes — o artista **vê** o que as pessoas pedem, sem tomar o lugar do dono na política nem na execução gravada. |
| **Pedidos ao artista** | Quando o modo está **habilitado**, o público pode **pedir música diretamente para o artista** (fluxo distinto da fila automática, mas alinhado ao firewall e às regras do dia). |

---

## Onde isto encaixa no material existente (sem fechar implementação)

- **Política e elegibilidade:** [04-rules-firewall.md](../specs/04-rules-firewall.md) (o quê pode ser pedido/votado continua a mandar no dono).
- **Fila, votos e fichas:** [06-queue-voting-and-chips.md](../specs/06-queue-voting-and-chips.md) (fonte de sinais agregados).
- **Descoberta, link e QR:** [05-discovery-and-access.md](../specs/05-discovery-and-access.md) (convite ao artista como variante de acesso controlado).
- **Superfície pública / telão:** [12-telao-display-publico.md](../specs/12-telao-display-publico.md) (vizinhança de “o que se vê no espaço” vs. vista **privada** do artista — a delimitar).
- **Personas e jornadas:** [02-personas-and-journeys.md](../specs/02-personas-and-journeys.md) (extensão futura: papel “artista convidado”).

---

## Riscos e decisões em aberto (para a futura spec)

- Separar claramente **vista artista** (leitura + pedidos ao vivo) de **controlo do player** e de **modo telão**.
- **Revogação** do link/QR, **TTL** do convite e limites anti-abuso nos pedidos ao palco.
- **Fronteira legal:** pedido ao vivo não substitui licenciamento de execução pública nem obrigações com obras; ver [14-fronteiras-legais-direitos-autorais.md](../specs/14-fronteiras-legais-direitos-autorais.md).

Quando estes pontos estiverem fechados, o texto normativo deve migrar para uma spec numerada em `docs/specs/` e este ficheiro permanece como **racional de disrupção** e histórico de intenção.
