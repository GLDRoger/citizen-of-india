import type { Metadata } from "next";
import { Anek_Devanagari, Anek_Kannada, Anek_Latin, Geist } from "next/font/google";
import type { ReactNode } from "react";
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
  title: {
    default: "Citizen of India | Life events and public services",
    template: "%s | Citizen of India",
  },
  description: "Handle life events, records, benefits, deadlines, and public-service paperwork in plain language.",
  applicationName: "Citizen of India",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${devanagariFont.variable} ${kannadaFont.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
