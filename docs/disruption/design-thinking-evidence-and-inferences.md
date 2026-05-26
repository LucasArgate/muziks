# Evidências e inferências (design thinking)

Este arquivo **não** é o [Manifesto](../MANIFESTO.md). Junta **relatos de campo**, **contexto de pesquisa** e **inferências** que alimentaram o produto — matéria demasiado concreta para o manifesto, que deve ficar na **essência** e nos **princípios**.

## Método e limitações

- Trabalho no âmbito de uma **aceleração de startups**, com **pesquisa de empatia** e ciclo de **design thinking** (entrevistas, observação de campo, síntese).
- Objetivo da pesquisa: **entender e inferir** como a **música conectava pessoas** em lugares ou eventos e como **democratizar o poder de escolha** da música — não apenas “validar uma ideia no papel”.
- **Dados quantitativos da pesquisa de empatia** não foram preservados até hoje; o que resta dessa fase é **memória qualitativa** e conclusões úteis — com o rigor que isso impõe: são **indícios**, não estatística.
- **Telemetria operacional quantitativa** do produto antigo (2016–2017) foi **recuperada parcialmente** depois — ver [analytics/README.md](../analytics/README.md) (pedidos, buscas, bares). Isso **não** repõe a pesquisa de empatia; complementa com baseline histórico.

## Releitura imparcial de contexto (2015 → 2026)

Algumas barreiras que eram **críticas** para a primeira geração do Muziks mudaram de natureza. Esta secção não prova tração atual; apenas separa mudanças de contexto de hipóteses que ainda precisam de validação em campo.

### QR Code e acesso ao físico

Em 2015, QR Code era uma barreira cognitiva e operacional: muitos celulares não liam nativamente, parte do público precisava instalar aplicativo, havia desconfiança sobre o link e o gesto de apontar a câmera para entrar numa experiência digital ainda não era cotidiano.

No contexto pós-pandemia, QR Code, link curto, cardápio digital, check-in e pagamento por celular tornaram-se comportamentos mais familiares. Isso reduz o atrito de entrada para experiências digitais em ambientes físicos, mas não elimina a necessidade de **copy clara**, URL digitável e fallback quando a câmera, a rede ou a confiança falham.

**Hipótese a validar:** participantes em bares, restaurantes e eventos aceitam melhor escanear um QR Code para entrar no player do que aceitariam na primeira geração do produto.

**Perguntas úteis de empatia:**

- Quando você vê um QR Code num estabelecimento, qual é sua reação?
- Em que situações você costuma escanear QR Codes sem receio?
- O que faria você evitar escanear um QR Code?
- Você prefere QR Code, link curto, buscar pelo nome do lugar ou outro caminho?

### Valor percebido antes e depois da agência

O Muziks não deve assumir que “todo mundo liga para música” nem que escolher a trilha do lugar é uma dor declarada da maioria. Em muitos contextos, música ambiente é percebida como pano de fundo até o momento em que ela incomoda, melhora a experiência ou abre uma possibilidade concreta de participação.

A hipótese de produto é que existe diferença entre **não sentir falta** de uma ferramenta e **perceber valor** depois de experimentar agência simples, limitada e contextual. A pesquisa deve investigar em quais ambientes a participação musical vira pertencimento, diversão ou permanência, e em quais ambientes ela é irrelevante ou até inadequada.

**Hipótese a validar:** mesmo sem declarar necessidade prévia de controlar a música, parte do público percebe valor quando pode sugerir, votar ou influenciar a fila com baixo esforço e dentro das regras do lugar.

**Perguntas úteis de empatia:**

- Você costuma reparar na música de bares, restaurantes, festas ou eventos?
- A música já melhorou ou piorou sua experiência em algum lugar?
- Em quais contextos você gostaria de sugerir ou votar em músicas?
- O que seria aceitável: sugerir, votar, priorizar, escolher diretamente ou apenas reagir?
- Que controle o estabelecimento deveria manter para a experiência continuar justa?

### Fronteiras legais como parte da confiança

Outra barreira relevante da primeira geração era explicar com precisão o papel do Muziks: o produto não existe para vender música, distribuir catálogo próprio ou substituir licenças de execução pública. A tese atual é que o Muziks atua como **camada de participação, fila e política** sobre uma reprodução sonora executada pelo dono do player no seu contexto e conforme os contratos e obrigações aplicáveis.

Na pesquisa, esta fronteira importa porque confiança não é só técnica: participantes e donos precisam entender que votar numa faixa, sugerir uma música ou participar da fila é diferente de comprar a obra, licenciar execução pública ou assumir controle irrestrito do som.

**Hipótese a validar:** regras claras de participação, controle final do dono e transparência sobre o papel do Muziks aumentam a aceitação do produto por participantes e estabelecimentos.

**Perguntas úteis de empatia:**

- Quem deveria ter a palavra final sobre a música do lugar?
- Você vê diferença entre sugerir, votar e escolher diretamente uma música?
- Que regras fariam essa participação parecer justa?
- O que faria essa experiência parecer invasiva, ilegal ou inadequada?
- Como o sistema deveria lidar com músicas ofensivas, repetidas ou fora do clima?

---

## Relatos e observações (evidência qualitativa)

### Padrão técnico: muitas mãos, um só som

Em festas, bares, casas e viagens, o mesmo padrão repete-se: **ou** alguém domina o Bluetooth, **ou** o Chromecast vira disputa de controle remoto, **ou** a fila colaborativa de um streaming (no estilo *jam*) vira geléia — todo mundo mexe, ninguém sabe quem manda, e o que parecia democracia vira **bagunça com volume alto**.

### Bar: solução aberta desfeita

Num bar, pouco depois de instalarem uma solução aberta no som, **o que funcionava virou ruína**: uma pessoa passou a **tomar a fila dos outros** pelo YouTube, trocando o que tocava sem acordo — e em pouco tempo **tinham desmontado tudo** o que tinham montado ali.

### Bar: música como choque de identidade

Noutro espaço, **houve conflito** quando alguém enfileirou o hino do Corinthians num espaço com cultura declarada de São Paulo: não era “só música”; era **identidade, rivalidade e convivência** chocando com um player que **não tinha política** — só tinha “quem chega primeiro”.

### Outras situações

Ao longo do tempo surgiram **várias situações semelhantes** (conflitos leves a tensos, desconfiança no controle do som, desistência de abrir a fila ao público). Não estão todas escritas aqui; o padrão é recorrente.

---

## Inferências (do campo para o produto)

1. **Abrir o som sem acordo explícito** gera mais fricção do que fechar: disputa de controle, fila opaca ou “primeiro a chegar” — e **confiança** no espaço e no dono do som **quebra** depressa.
2. **Música em espaço compartilhado não é neutra**: liga-se a identidade de grupo, rivalidade saudável ou não, e **convivência**; sem **política** (o quê, quando, quem manda), escolhas pequenas tornam-se **incidentes**.
3. **Democratizar a fila sem regra** é armadilha para o dono, para o estabelecimento e para quem só quer participar sem drama — alinha com a promessa do manifesto: **democracia com política**.
4. A pesquisa apontou também necessidades **executáveis** (ex.: **telão**, QR, feedback social visível) — estão em **[12-telao-display-publico.md](../specs/12-telao-display-publico.md)** e restantes **[`docs/specs/`](../specs/README.md)**, não no manifesto.

---

## Ligações

- [Manifesto Muziks](../MANIFESTO.md) — intenção e princípios.
- [Especificações](../specs/README.md) — comportamento de produto e engenharia.
- [Mapa de disrupções: dores e soluções](mapa-dores-e-solucoes.md) — cruza estes relatos e inferências com o manifesto e as specs.
- [Artista ao vivo: temperatura e fila](artista-ao-vivo-temperatura-e-fila.md) — hipótese de produto (palco + fila digital), fora dos relatos de campo deste ficheiro.
- [Karaokê na era da IA e LLMs de borda](karaoke-era-ia-e-llms-de-borda.md) — hipótese de produto (implementação futura), fora dos relatos de campo deste ficheiro.
