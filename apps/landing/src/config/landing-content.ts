export const LANDING_URLS = {
  app: "https://muziks.app",
  player: "https://player.muziks.app",
  github: "https://github.com/LucasArgate/muziks",
  manifesto:
    "https://github.com/LucasArgate/muziks/blob/main/docs/MANIFESTO.md",
  design:
    "https://github.com/LucasArgate/muziks/blob/main/docs/DESIGN.md",
  license: "https://github.com/LucasArgate/muziks/blob/main/LICENSE",
  email: "mailto:contato@muziks.com.br",
  emailBar: "mailto:contato@muziks.com.br?subject=Quero%20o%20Muziks%20no%20meu%20bar",
} as const;

export const LANDING_ASSETS = {
  heroArtwork: "/hero/hero-artwork.jpg",
  logoWhite: "/brand/muziks-white.png",
  /** Ícone de faders (OG / marca em cards). */
  ogIcon: "/brand/muziks-og-icon.png",
  icon: "/brand/muziks-icon.png",
} as const;

export const howItWorksSteps = [
  {
    n: "01",
    title: "Escaneia o QR da mesa",
    body: "Sem cadastro chato. Encontre o player do bar por QR Code, link ou geolocalização.",
  },
  {
    n: "02",
    title: "Pede a música que quer ouvir",
    body: "Busca, escolhe e adiciona. Se a faixa não cabe na política do espaço, o app explica em linguagem humana — sem código de erro.",
  },
  {
    n: "03",
    title: "Chame os amigos pra votar",
    body: "A ordem é democrática: quanto mais gente pedir a mesma música, mais rápido ela toca. Sem furar fila.",
  },
] as const;

export const queuePreviewTracks = [
  { title: "Aquarela do Brasil", artist: "Gal Costa", votes: 24, mine: true },
  { title: "Smells Like Teen Spirit", artist: "Nirvana", votes: 18 },
  { title: "Take Five", artist: "Dave Brubeck", votes: 12 },
  { title: "Mas que Nada", artist: "Sérgio Mendes", votes: 9 },
  { title: "Bohemian Rhapsody", artist: "Queen", votes: 7 },
] as const;

export const queuePreviewBullets = [
  "Regras por gênero, artista e música — como um firewall de som.",
  "Política diferente por dia da semana: sexta ≠ terça.",
  "Cortesia quando algo não é permitido: sugere alternativa.",
] as const;

export const forBarsFeatures = [
  {
    title: "Controle fino, sem microgerenciar",
    body: "Você define o universo — gênero, artista, faixa. O público escolhe dentro disso. Curadoria que se sustenta sozinha.",
  },
  {
    title: "Política por dia da semana",
    body: "Sexta universitária, terça acústica. Configure regras diferentes para cada clima do seu espaço.",
  },
  {
    title: "Telão e QR na mesa",
    body: "Player visível, fila transparente, identidade sonora protegida. Os clientes participam — você mantém o som da casa.",
  },
  {
    title: "Fichas opcionais",
    body: "Quer cobrar pelo voto? Use fichas vendidas no balcão. Renda no mecanismo de participação, não na música.",
  },
] as const;

export const createSpaceSteps = [
  { n: "01", t: "Abra o Player no telão ou no caixa" },
  { n: "02", t: "Defina a política do espaço (gênero, dia, artista)" },
  { n: "03", t: "Gere o QR Code e cole nas mesas" },
  { n: "04", t: "A fila democrática começa imediatamente" },
] as const;

export const nowPlayingDemo = {
  venue: "Bar POCO LOCO",
  title: "Garota de Ipanema",
  artist: "João Gilberto",
  elapsed: "1:42",
  duration: "4:03",
  progressPercent: 42,
  votersLabel: "+12 pediram",
} as const;

export const testimonialContent = {
  quote:
    "Com o Muziks, a solução ficou tão simples que, para quem chega no balcão pedindo para mexer no som, basta um “é só ler o QR Code!” e o problema está resolvido. Garante um pouco mais de paz para o bar e oportunidade para os clientes participarem democraticamente do que deve tocar.",
  author: "Douglas Marajoli",
  role: "Gerente do bar Universitário POCO LOCO",
} as const;

export const closedBetaStatus = [
  { label: "Status:", value: "em desenvolvimento ativo" },
  { label: "Stack:", value: "PWA — abre direto no navegador" },
  { label: "Código:", value: "open source (Apache 2.0)" },
] as const;

export const avatarStackGradients = [
  "linear-gradient(135deg,#ff6b6b,#c44569)",
  "linear-gradient(135deg,#3aa0ff,#0066B2)",
  "linear-gradient(135deg,#ffd166,#ef476f)",
  "linear-gradient(135deg,#06d6a0,#118ab2)",
] as const;
