import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#20283b" },
  ],
};

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon" },
      { url: "/pwa-icon-192", sizes: "192x192", type: "image/png" },
      { url: "/pwa-icon-512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
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
  appleWebApp: {
    capable: true,
    title: "FinControl",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const fontSans = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
          ${fontMono.variable}
          antialiased
        `}
      >
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
