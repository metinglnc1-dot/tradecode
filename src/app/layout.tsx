import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeCode — SMC Analyzer",
  description: "BTC / ETH / Gold Smart Money Concepts Analiz Paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
