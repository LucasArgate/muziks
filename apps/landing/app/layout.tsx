import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Muziks — música compartilhada no seu bar",
  description:
    "Ideal para criar playlists e música ambiente de acordo com o gosto dos seus clientes. Fila democrática com regras claras.",
  icons: {
    icon: "/brand/Muziks-152.png",
    apple: "/brand/Muziks-152.png",
  },
  openGraph: {
    title: "Muziks",
    description:
      "Música compartilhada com regras claras — democracia da fila com política.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
