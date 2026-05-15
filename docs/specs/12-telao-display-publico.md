# Telão e tela pública (modo display)

Este documento especifica o **telão** — tela grande no espaço físico que representa o player — e o papel dele em **descoberta**, **engajamento** e **escala**. Não faz parte do [Manifesto](../MANIFESTO.md); o manifesto fixa intenção e princípios; aqui está o **comportamento de produto** pretendido.

## Origem (contexto histórico do projeto)

Numa **aceleração de startups** da época, conduziu-se **pesquisa de empatia profunda** (design thinking): entrevistas, observação de campo e síntese — não para “validar ideia no ar”, mas para entender **como o som vive no corpo do lugar**. O aprendizado central naquele ciclo foi a necessidade de um **telão**: algo **visível para a sala**, não só para o celular de cada um.

Os **registros detalhados** dessa pesquisa **não foram preservados até hoje**; esta spec consolida o que se pretende **reproduzir** no renascimento do produto.

## Definição

O **telão** (ou *display* público / “screen”) é a **representação visual do player** no espaço: fila, faixa em destaque, clima da participação. Quando alguém escolhe (ou vota, conforme o fluxo), a tela pode mostrar **quem entrou na jogada** — por exemplo, a **foto** de quem escolheu e o registro de **quem mais escolheu** aquela faixa — para dar **feedback social imediato**. O celular continua sendo o controle; o ambiente ganha **palco compartilhado**.

## Valor de negócio (o que se viu na prática)

Naquela fase, esse desenho foi o **ponto alto de aderência, escala e expansão**: o próprio telão **convidava** — **QR** visível, movimento da fila, curiosidade de “entrar também”. Novos participantes **puxavam outros**; a base crescia de forma orgânica, além de boca a boca abstrato.

## Onde habilitar (produto)

O modo telão **não** é obrigatório em todo contexto. Recomenda-se que o dono possa **ligar ou desligar** por player ou por evento, com perfis típicos:

- **Bares universitários** e formatos com público jovem e alta densidade.
- **Eventos fechados** (festas, formaturas, competições) em que a energia coletiva compensa exposição pública.

Em **Uber, chácara discreta, contexto só PWA**, o produto pode viver **sem** telão; a descoberta segue por link, slug e GPS conforme [05-discovery-and-access.md](05-discovery-and-access.md).

## Requisitos funcionais (normativos)

- **T1:** O dono deve poder **ativar e desativar** o modo telão sem derrubar o player no mobile.
- **T2:** O telão deve refletir **estado coerente** com o player (fila, destaque da faixa atual ou próxima — definir na implementação).
- **T3:** Deve existir **QR** no telão (ou equivalente legível à distância) apontando para o mesmo **deep link** de entrada usado no fluxo mobile ([05-discovery-and-access.md](05-discovery-and-access.md)).
- **T4:** Qualquer exibição de **foto, nome ou identidade** no telão deve respeitar **consentimento explícito** e políticas de privacidade ([08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md)); modo degradado sem foto se o utilizador não optar.

## UX e privacidade

- Telão com rosto na parede é **alto impacto**; copy e opt-in devem deixar claro **o que aparece onde**.
- Alinhar ao princípio 8 do manifesto (abuso, revogação): dono pode **cortar** exibição sensível em incidente.

## Relação com outros documentos

- Descoberta e QR: [05-discovery-and-access.md](05-discovery-and-access.md) (visão geral; este doc aprofunda o **telão**).
- Tração pós-MVP: [01-vision-and-scope.md](01-vision-and-scope.md).
- Backend (sincronização em tempo real do telão): [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md).
