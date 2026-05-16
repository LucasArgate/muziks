# Canal de mídia no player: “rádio do espaço” e inventário no salão

**Referência:** maio/2026. **Natureza:** hipótese de **negócio e produto** — não é assessoria jurídica; qualquer *spot* envolve **direitos** e **expectativa** do público.

## Para que serve este documento

Consolidar a ideia de que o **dono controla o player** e, portanto, pode **interromper temporariamente** a sequência de música para reproduzir **comunicação própria ou de parceiros** no **mesmo canal** (som + telão + atenção da sala). O espaço **já pagou** pelo *hardware*, pelo tempo e pelo fluxo de pessoas; o software **habilita** um *stream* de valor **complementar** à assinatura do Muziks.

**Leitura cruzada:** mapa geral de receita em [01-receita-rentabilidade-e-go-to-market.md](01-receita-rentabilidade-e-go-to-market.md); controle do dono e fila em [06-queue-voting-and-chips.md](../specs/06-queue-voting-and-chips.md); telão em [12-telao-display-publico.md](../specs/12-telao-display-publico.md); copy e estados em [07-ux-copy-and-states.md](../specs/07-ux-copy-and-states.md); privacidade em [08-nfr-privacy-accessibility.md](../specs/08-nfr-privacy-accessibility.md); direitos em [14-fronteiras-legais-direitos-autorais.md](../specs/14-fronteiras-legais-direitos-autorais.md).

---

## Premissa

O **dono controla o player** (pausar fila, política, *firewall* — ver [fila e voto](../specs/06-queue-voting-and-chips.md)). Isso abre um **ativo de mídia** pouco explorado em muitos apps de fila: **o tempo de atenção no salão** no mesmo canal em que já há **música**, **telão** e **público captivo** ([telão](../specs/12-telao-display-publico.md)).

---

## O que o espaço já tem (custo afundado para o dono)

- **Player + som** no ambiente.
- **Telão** (quando habilitado): QR, fila, destaque social.
- **Calendário comercial** natural: happy hour, lançamento de cardápio, evento com artista, parceria com distribuidor.

---

## Hipótese de valor

O dono **pausa** (ou “suspende temporariamente”) a sequência de música acordada e **reproduz** um bloco de **áudio e/ou vídeo institucional** — *spots* da **casa** (prato, drink, festa no próprio bar) ou de **parceiros** (bebida, artista, marca local).

Não é um “novo stream” no sentido de plataforma OTT; é **canal físico-digital** com **audiência in-room**, mensurável de forma simples (sessões, horários, *impressions* no telão se houver *asset* visual).

---

## Quem monetiza o quê

| Papel | O que vende | O que o Muziks (ou ecossistema) pode cobrar |
|--------|-------------|---------------------------------------------|
| **Dono do espaço** | Tempo de ouvido-visual no **seu** salão; pacotes a fornecedores/cantores | **100%** da receita de mídia local (software só habilita) |
| **Muziks (rede)** | **Agenciamento** de *slots* em rede de espaços (“compra 50 bares, 10 s/dia”) | **Take rate** ou taxa de plataforma **se** existir marketplace de mídia |
| **Self-serve no produto** | Calendário de *slots*, upload de *assets*, relatório mínimo | **Add-on SaaS** (“módulo campanhas”) sem tocar no dinheiro do anunciante |

**Gera valor para o dono** porque transforma **infraestrutura já ligada** (noite, caixa, marca do bar) em **inventário** — sem exigir que o participante “pague mais ficha” para o bar lucrar com mídia; o paralelo é **comunicação de balcão**, só que **sincronizada** com o telão e o ritmo da noite.

---

## Modelos de operação (do mais simples ao mais ambicioso)

1. **Manual (MVP de negócio):** dono sobe arquivo ou link, dispara *spot*, retoma fila — sem marketplace; já valida **há demanda** e **frequência aceitável**.
2. **Calendário + rotação:** *slots* por horário (ex.: 22h05–22h07), limite de duração, **código de conduta** e registro de quem patrocinou (auditoria interna).
3. **Canal / agência:** equipe comercial Muziks ou **parceiro regional** vende pacotes a marcas; o dono recebe **rev share** ou **aluguel de espaço** fixo — exige **contratos** e clareza de **LGPD** se houver segmentação por dados (preferir **não** depender de dados pessoais no início).

---

## Riscos e guardrails (produto + legal)

- **Expectativa do participante:** fila e voto são **lúdicos**; *spots* longos ou agressivos **queimam** confiança. Mitigar com **duração máxima**, **frequência** tabelada e **copy** honesta (ver [UX e estados](../specs/07-ux-copy-and-states.md)).
- **Direito autoral do *spot*:** o bar não pode “tocar qualquer MP3 de campanha” sem licença da peça publicitária/música de fundo do anúncio — alinhar a [fronteiras legais](../specs/14-fronteiras-legais-direitos-autorais.md).
- **Telão e identidade:** se o *spot* usar rosto de cliente ou UGC, volta o pacote **consentimento** ([privacidade](../specs/08-nfr-privacy-accessibility.md), [telão](../specs/12-telao-display-publico.md)).

---

## Síntese estratégica

Esse **fluxo de receita** escala com **público e reputação do espaço**, não só com assinatura do software: o Muziks pode **ganhar** vendendo **ferramenta + métrica + credibilidade da rede**, enquanto o dono **ganha** com **mídia local e parcerias** — **ativos complementares**, não concorrentes.

---

## Manutenção

Quando *slots* de mídia virarem **requisitos normativos** de produto (estados do player, telão em modo *promo*, limites de duração), espelhar as regras nas **specs** correspondentes; este ficheiro permanece como **quadro de negócio** e *trade-offs*.
