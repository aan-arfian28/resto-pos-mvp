import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SWRegister } from "@/components/ui/SWRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BistroFlow POS - Sistem POS Restoran Modern",
    template: "%s | BistroFlow POS",
  },
  description:
    "POS system modern untuk restoran Indonesia. Offline-ready, real-time kitchen sync, manajemen meja efisien, dan laporan lengkap.",
  keywords: [
    "POS",
    "restoran",
    "kasir",
    "bistroflow",
    "point of sale",
    "manajemen restoran",
  ],
  authors: [{ name: "BistroFlow" }],
  creator: "BistroFlow",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "BistroFlow POS",
    title: "BistroFlow POS - Sistem POS Restoran Modern",
    description:
      "POS system modern untuk restoran Indonesia. Offline-ready, real-time kitchen sync.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A5D3A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SWRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
