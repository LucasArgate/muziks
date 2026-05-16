# Karaokê na era da IA: medição com LLMs de borda (edge)

**Estado:** hipótese de produto e **implementação futura** — texto de intenção, risco e viabilidade técnica; **não** constitui requisito normativo fechado. O mapa geral liga esta nota em [mapa-dores-e-solucoes.md](./mapa-dores-e-solucoes.md).

---

## Contexto

Experiências de **karaokê** ou **participação vocal** costumam depender de **metadados fixos** (letra, pitch “ideal”, pontuação heurística) e de **hardware ou apps fechados** para ir além. Com **modelos generativos e de classificação** a correr **no dispositivo** (navegador, *edge*, por vezes acelerado por GPU/WebAssembly), abre-se espaço para **sinais que antes eram impraticáveis** no mesmo canal de entrega do Muziks: uma **PWA web-first**.

O Muziks já trata **distribuição** como parte da solução — **player** democrático, **telão** opcional, **pessoas** no lugar certo (link, QR, geolocalização) — isto é, **fossos** estruturais. Uma camada de IA em borda **não substitui** esses fossos; **potencia** engajamento e diferenciação quando (e só quando) o custo de engenharia e de operação fizer sentido.

---

## Dor (abstração)

1. **Sinais pobres na web:** sem processamento pesado no cliente, fica difícil ir além de “tocar a base + mostrar letra” — **feedback fino** (afinação ao longo do tempo, energia, articulação, consistência rítmica) ou **contexto semântico** da performance ficam fora do alcance de um produto **100% web** leve.
2. **Sensibilidades invisíveis para regras só por metadados:** política por gênero/artista/faixa ([04](../specs/04-rules-firewall.md)) resolve muito do **catálogo**, mas não **o que acontece na sala em tempo real** (ex.: improviso vocal problemático). **Moderação assistida** ou **classificação de risco** em tempo quase real exige modelos — e enviar áudio bruto ao servidor levanta **privacidade, custo e latência**.
3. **Comparação musical é cara:** alinhar performance ao fonograma de referência, *scoring* musical credível, ou análise de similaridade **exige** pipelines de áudio, calibração por dispositivo e validação — **muito esforço de engenharia** em relação ao núcleo da fila e do firewall.
4. **Engajamento platô:** onde o karaokê é o gancho social, falta **camada de jogo ou de retorno** que se sinta “justa” e **local** (no aparelho do utilizador), sem depender de instalações nativas por loja de aplicações.

---

## Solução (direção Muziks — futura)

Explorar **LLMs e modelos de áudio/linguagem em borda** (execução predominantemente **no browser**), com arquitetura que preserve os princípios já do produto:

| Ideia | Papel |
|--------|--------|
| **Medição rica no cliente** | Detectar ou estimar propriedades da performance e do ambiente que **metadados sozinhos** não captam; reduzir dependência de round-trips ao servidor para o que for sensível. |
| **Sensibilidades e dados novos** | Classificações auxiliares (ex.: risco de conteúdo, tom, consistência) alimentam **UX**, **limites do dono** ou **telemetria agregada** — sempre com **consentimento**, transparência e NFRs em [08](../specs/08-nfr-privacy-accessibility.md). |
| **Viabilidade web** | Tecnologias emergentes (runtime no cliente, quantização, APIs de GPU onde existirem) tornam o caminho **escalável por utilizador** em vez de por rack dedicado de karaoke clássico. |
| **Alavanca fossos existentes** | O mesmo **player + telão + pessoas** continua a ser o veículo de distribuição; a IA **aumenta engajamento** e profundidade **em cima** desse chão, não em concorrência com ele. |

---

## Panorama técnico (referência): Gemma 4 e *edge* hoje

Isto **não** escolhe stack para o Muziks; documenta **o que já existe** em 2026 para sustentar a tese de que inferência local deixou de ser só promessa de *roadmap*.

### Gemma 4 (Google DeepMind)

A família **Gemma 4** é apresentada como modelos **abertos** (pesos sob **Apache 2.0**), com forte ênfase em **eficiência por parâmetro** e em casos **agentic** (planejamento multi-passo, *tool calling*, saídas estruturadas). Há variantes **E2B** e **E4B** orientadas a **mobile e IoT**: multimodalidade **áudio e visão** para processamento em tempo quase real na borda, com foco em execução **offline** em dispositivos como **smartphones**, **Raspberry Pi** e **Jetson Nano**. As variantes **26B** e **31B** visam estações de trabalho com GPU de consumidor (“*local-first*”). Suporte declarado a **140+ línguas**, *fine-tuning* e *benchmarks* públicos estão no *landing* do produto e no *model card* ligado a partir daí.

- Página oficial e *benchmarks*: https://deepmind.google/models/gemma/gemma-4/
- *Model card* (documentação Google AI para desenvolvedores): https://ai.google.dev/gemma/docs/core/model_card_4

### Google AI Edge, galeria e LiteRT-LM

O anúncio de produto de **abril de 2026** posiciona Gemma 4 como motor de experiências **no dispositivo**: **Android AICore** (*Developer Preview*), **[Google AI Edge](https://ai.google.dev/edge)** e **[Google AI Edge Gallery](https://github.com/google-ai-edge/gallery)** (aplicações **iOS** e **Android** para experimentar modelos **inteiramente no dispositivo**, incluindo **Agent Skills** com Gemma 4 E2B/E4B). Para integração em *apps* e gama larga de hardware, **[LiteRT-LM](https://ai.google.dev/edge/litert-lm/overview)** empilha bibliotecas de GenAI sobre **LiteRT**, com destaque para **pegada de memória** reduzida (ex.: quantização **2-bit** e **4-bit**, *memory-mapped*), **128K** de contexto e **decoding** constrangido para saídas **confiáveis** em produção — relevante para **moderação** e **JSON** estruturado.

Importante para o **Muziks como PWA**: o mesmo artigo afirma desempenho em **Windows, Linux e macOS** e execução **no navegador com WebGPU** (“*native browser-based execution powered by WebGPU*”), alinhado com a direção **web-first** deste documento.

- Post Google Developers (edge, LiteRT-LM, WebGPU, galeria): https://developers.googleblog.com/en/bring-state-of-the-art-agentic-skills-to-the-edge-with-gemma-4/
- Pesos comunitários LiteRT-LM no Hugging Face (exemplos oficiais de *packaging*): https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm e https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm

### Ecossistema aberto no browser (adjacente)

Em paralelo ao stack Google, o ecossistema **Hugging Face** evoluiu **Transformers.js** (v4 em 2026) com *runtime* **WebGPU** nativo (colaboração com **ONNX Runtime**), suporte ampliado a arquiteturas e a modelos maiores no cliente — útil como **referência de engenharia** para “100% web” sem amarrar o produto a um único fornecedor de modelo.

- Anúncio Transformers.js v4 (WebGPU, ONNX, desempenho): https://huggingface.co/blog/transformersjs-v4

Outras linhas comuns em *edge* (sem lista exaustiva): **Llama**, **Mistral**, **Phi** / **SLMs** Microsoft, **GGUF** + **llama.cpp**, exportação **ONNX** + **ONNX Runtime Web** — todas competem no mesmo espaço de **inferência local**, com trade-offs de **licença**, **tamanho**, **latência** e **qualidade** por tarefa (texto vs. áudio vs. classificação).

### Leitura para o Muziks

- **Multimodal áudio** nas variantes E2B/E4B reforça o encaixe com **karaokê** e *feedback* vocal; ainda assim, **MVP do Muziks** não depende disto — ver secção seguinte sobre custo e risco.
- **WebGPU** no browser e **PWA** são coerentes entre si, mas exigem **matriz de dispositivos**, *fallback* (CPU/WASM) e UX honesta quando o modelo **não carrega** ou **é lento**.
- **Licença dos pesos** (Apache 2.0 no Gemma 4) não confunde com **licença da obra musical** — [14](../specs/14-fronteiras-legais-direitos-autorais.md) continua a mandar no fonograma e na obra.

---

## Custo e realismo

- **Engenharia:** integração áudio ↔ modelo, *fallbacks* por dispositivo fraco, testes, versionamento de modelos e regressão de UX.
- **Produto:** expectativas de “IA perfeita” vs. erros; **falsos positivos** em moderação; copy e estados honestos ([07](../specs/07-ux-copy-and-states.md)).
- **Legal e obras:** karaokê toca **fonogramas** e **obras**; a camada de IA **não** resolve licenciamento — mantém-se [14](../specs/14-fronteiras-legais-direitos-autorais.md).

---

## Onde isto encaixa no material existente

- **PWA e estratégia cliente:** [10-pwa-strategy.md](../specs/10-pwa-strategy.md).
- **Telão e “palco” digital:** [12-telao-display-publico.md](../specs/12-telao-display-publico.md).
- **Privacidade e dados:** [08-nfr-privacy-accessibility.md](../specs/08-nfr-privacy-accessibility.md); descoberta e abuso: [05](../specs/05-discovery-and-access.md).
- **Decisões de backend e o que fica local:** [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md).

Quando houver decisão de investir nesta linha, o comportamento normativo deve passar para uma **spec dedicada** em `docs/specs/` (limites, opt-in, telemetria, desempenho mínimo, desligamento total da funcionalidade).
