# Arquitetura de frontend

## Stack fixa

- **Empacotador:** Vite.
- **UI:** React 18 + TypeScript.
- **Estilo:** Tailwind CSS.
- **Componentes:** shadcn/ui em `src/components/ui/` (primitivos genéricos).
- **Pacotes:** `pnpm` ([AGENTS.md](../../AGENTS.md)).

## Atomic Design (não duplicar aqui)

A convenção de pastas **atoms → pages** e a relação com shadcn estão em [ATOMIC-DESIGN.md](../tech/ATOMIC-DESIGN.md). Agentes e devs devem ler esse arquivo antes de criar componentes.

## Convenções complementares (Muziks)

Estas pastas **complementam** o Atomic Design sem substituí-lo:

| Caminho sugerido | Uso |
|------------------|-----|
| `src/lib/` | Utilitários puros (`cn`, formatadores, helpers de domínio leve). |
| `src/hooks/` | Hooks reutilizáveis sem UI (ex.: geolocalização, online/offline). |
| `src/features/<nome>/` | **Fatias verticais** opcionais (ex.: `features/player-queue/`) quando um fluxo crescer: coloca **páginas/organismos** específicos e dados do feature ali para não inflar `components/` raiz. Ainda deve respeitar Atomic Design **dentro** do feature quando fizer sentido. |
| Rotas | Definir quando o roteador for adicionado (ex.: React Router em `src/app/` ou `src/routes/` — decisão junto de [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md)). |

## Alias

- `@/` → `src/` ([AGENTS.md](../../AGENTS.md)).

## Qualidade

- Alterações de código: `pnpm lint` quando tocar em implementação.
- **Não** criar arquivos de teste automatizados neste repositório (política do projeto).

## Separação de responsabilidades

- **`components/ui/`:** apenas primitivos shadcn; sem regra de negócio do Muziks.
- **Regras de negócio e composição de fluxo:** organismos/páginas + camada de dados (quando existir) — ver [03-domain-model.md](03-domain-model.md).
