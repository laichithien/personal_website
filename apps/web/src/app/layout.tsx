import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your Name | AI Engineer",
  description: "The Transparent Core - Digital Identity of an AI Engineer",
  keywords: ["AI Engineer", "Portfolio", "Homelab", "Full Stack"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Your Name | AI Engineer",
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
