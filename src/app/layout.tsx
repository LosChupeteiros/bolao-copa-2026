import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolão Copa 2026 🇧🇷",
  description: "Bolão da família para a Copa do Mundo 2026 — fase eliminatória",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Bolão Copa 2026 🇧🇷",
    description: "Faça seus palpites e dispute com a família!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#009C3B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-copa min-h-screen">{children}</body>
    </html>
  );
}
