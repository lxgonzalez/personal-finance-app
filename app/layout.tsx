import type { Metadata } from "next";
import { Architects_Daughter, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FinControl",
    template: "%s | FinControl",
  },
  description:
    "FinControl te ayuda a organizar ingresos, gastos y categorias con una vista simple, clara y rapida.",
  keywords: [
    "finanzas personales",
    "control de gastos",
    "presupuesto",
    "ingresos",
    "categorias",
    "ahorro",
  ],
  applicationName: "FinControl",
  authors: [{ name: "FinControl" }],
  creator: "FinControl",
  publisher: "FinControl",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    siteName: "FinControl",
    title: "FinControl",
    description:
      "FinControl te ayuda a organizar ingresos, gastos y categorias con una vista simple, clara y rapida.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinControl",
    description:
      "FinControl te ayuda a organizar ingresos, gastos y categorias con una vista simple, clara y rapida.",
    images: ["/opengraph-image"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#20283b" },
  ],
};

const fontSans = Architects_Daughter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`
          ${fontSans.variable}
          ${geist.variable}
          ${geistMono.variable}
          antialiased
        `}
      >
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
