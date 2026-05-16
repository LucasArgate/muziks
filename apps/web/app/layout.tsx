import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Muziks App",
  description:
    "Player colaborativo — entre na fila pelo link do seu espaço.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Muziks App",
    description:
      "Player colaborativo — entre na fila pelo link do seu espaço.",
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
