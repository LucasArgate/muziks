import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muziks",
  description:
    "Música compartilhada com regras claras — democracia da fila com política.",
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
