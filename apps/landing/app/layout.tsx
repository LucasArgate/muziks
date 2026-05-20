import type { Viewport } from "next";
import { Inter } from "next/font/google";
import { rootLandingMetadata } from "@/src/config/landing-metadata";
import "./globals.css";

export const dynamic = "force-static";

export const metadata = rootLandingMetadata;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
