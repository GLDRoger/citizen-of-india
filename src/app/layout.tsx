import type { Metadata } from "next";
import { Anek_Devanagari, Anek_Kannada, Anek_Latin, Geist } from "next/font/google";
import type { ReactNode } from "react";
import { DocumentLanguage } from "@/i18n/document-language";
import "./globals.css";

const bodyFont = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Anek_Latin({
  variable: "--font-display-latin",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
});

const devanagariFont = Anek_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
  preload: false,
});

const kannadaFont = Anek_Kannada({
  variable: "--font-kannada",
  subsets: ["kannada"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://citizen-of-india.vercel.app"),
  title: {
    default: "Citizen | Independent prototype",
    template: "%s | Citizen",
  },
  description: "A public-services prototype with fictional records and demo-only payments, filings and certificates.",
  applicationName: "Citizen | Independent prototype",
  icons: {
    icon: "/citizen-logo.png",
    shortcut: "/citizen-logo.png",
    apple: "/citizen-logo.png",
  },
  openGraph: {
    title: "Citizen | Independent prototype",
    description: "Public services organized around the citizen, not the department.",
    images: [{ url: "/citizen-logo.png", width: 1254, height: 1254, alt: "Citizen" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Citizen | Independent prototype",
    description: "Public services organized around the citizen, not the department.",
    images: ["/citizen-logo.png"],
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${devanagariFont.variable} ${kannadaFont.variable} h-full antialiased`}>
      <body className="min-h-full"><DocumentLanguage />{children}</body>
    </html>
  );
}
