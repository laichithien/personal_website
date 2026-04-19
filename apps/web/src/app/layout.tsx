import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

import { portfolioConfig } from "@/config/portfolio";

export const metadata: Metadata = {
  title: `${portfolioConfig.hero.name} | ${portfolioConfig.hero.title}`,
  description: "The Transparent Core - Digital Identity of an AI Engineer",
  keywords: ["AI Engineer", "Portfolio", "Homelab", "Full Stack"],
  authors: [{ name: portfolioConfig.hero.name }],
  openGraph: {
    title: `${portfolioConfig.hero.name} | ${portfolioConfig.hero.title}`,
    description: "The Transparent Core",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
