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
  icons: {
    icon: "/brand/Muziks-152.png",
    apple: "/brand/Muziks-152.png",
  },
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
