# Atomic Design no Muziks

**Status:** convenção alvo para quando existir código do cliente no repositório (ver [`ESPECIFICACAO-FRONTEND.md`](./ESPECIFICACAO-FRONTEND.md)). As pastas abaixo são o **contrato de organização**, não uma árvore que precisa existir hoje.

Este documento fixa **onde cada tipo de componente deve morar**, para humanos e agentes acharem código rápido sem adivinhar pastas.

## O padrão em cinco níveis (do menor ao maior)

Brad Frost resume o Atomic Design como **camadas de complexidade crescente**:

1. **Átomos** — menores unidades de interface: botão, ícone, label, input isolado, badge. Não decompõem em UI menor *dentro do escopo do app*; podem usar HTML e tokens de estilo.

2. **Moléculas** — **combinação de poucos átomos** com um propósito único: campo de busca (input + botão), linha de meta-dado (ícone + texto), cartão de voto mínimo (título + botão). No player: `QueueTrackRowMeta`, `ParticipantAvatarStack`, `AddToQueueButton` — [16-ui-player-e-fila.md](../specs/16-ui-player-e-fila.md).

3. **Organismos** — **blocos completos** da interface: cabeçalho do player, lista da fila com scroll, painel de regras resumidas. Costumam juntar moléculas e átomos e já conversam com estado ou dados de um subdomínio da tela. Exemplos concretos do player participante: `PlayerHeroNowPlaying`, `QueueList` — ver [16-ui-player-e-fila.md](../specs/16-ui-player-e-fila.md).

4. **Templates** — **esqueleto de página** sem conteúdo real: posição das regiões (header, fila, área de votação), responsividade e grid. Serve para validar layout antes de plugar dados.

5. **Páginas (pages)** — **instância concreta** do template: mesma estrutura, com dados reais ou de mock, ligada a rota ou fluxo (ex.: “fila pública do bar X”).

Regra prática: se algo é **reutilizável e pequeno**, sobe na hierarquia só quando **compor outros** deixa de ser opcional e vira padrão do produto.

## Como isso se cruza com o shadcn (`components/ui`)

O shadcn entrega **primitivos acessíveis e estilizados** (muitas vezes equivalentes a *átomos* ou *moléculas* genéricas). No Muziks:

| Pasta | Uso |
|--------|-----|
| `src/components/ui/` | **Somente** componentes gerados/mantidos pelo **shadcn** (`button`, `card`, …). Evite lógica de negócio aqui. |
| `src/components/atoms/` | Átomos **específicos do Muziks** que não vêm do shadcn (ex.: logo, marca de “fila bloqueada”). |
| `src/components/molecules/` | Combinações reutilizáveis **do produto** (podem importar `@/components/ui/*`). |
| `src/components/organisms/` | Blocos grandes: fila, player, modais de regra. |
| `src/components/templates/` | Layouts de tela sem dados de negócio fixos. |
| `src/components/pages/` | Telas por rota/fluxo, compondo templates + organismos e conectando dados. |

Assim, agentes procuram **primitivo genérico** em `ui/`, **conceito do domínio** nas pastas `atoms` → `pages`.

## O que não é “átomo” só por ser pequeno

Um componente que **já encapsula regra de negócio** ou **vários contextos** (ex.: “card da música + voto + estado de bloqueio”) tende a **molécula ou organismo**, não átomo — o critério é **responsabilidade e composição**, não só tamanho do arquivo.

## Referência

- Brad Frost — [Atomic Design](https://atomicdesign.bradfrost.com/)
