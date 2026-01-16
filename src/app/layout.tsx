import type { Metadata } from "next";
import { Inter, Public_Sans } from "next/font/google";
import "./globals.css";
import { MobileShell } from "@/components/layout/MobileShell";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const publicSans = Public_Sans({ subsets: ["latin"], variable: '--font-data' });

export const metadata: Metadata = {
  title: "Talovahti",
  description: "Digital Twin & Governance Platform",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body className={`${inter.variable} ${publicSans.variable} font-sans bg-surface-lichen text-text-obsidian antialiased`}>
        <MobileShell>
          {children}
        </MobileShell>
      </body>
    </html>
  );
}
