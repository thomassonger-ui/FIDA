import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

// Branded production domain — the canonical site we want indexed.
const SITE_URL = "https://fldentalassisting.online";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Florida Institute of Dental Assisting",
    template: "%s | Florida Institute of Dental Assisting",
  },
  description:
    "Florida Institute of Dental Assisting (FIDA) trains dental assistants in Jacksonville, FL — an Entry Level Dental Assisting diploma plus EFDA and Radiography courses approved by the Florida Board of Dentistry.",
  keywords: [
    "dental assisting school Florida",
    "dental assistant training Jacksonville",
    "EFDA certification Florida",
    "dental radiography certification Florida",
    "expanded functions dental assistant",
    "Florida Board of Dentistry approved courses",
  ],
  openGraph: {
    type: "website",
    siteName: "Florida Institute of Dental Assisting",
    title: "Florida Institute of Dental Assisting",
    description:
      "Dental assisting training in Jacksonville, FL — Entry Level Dental Assisting diploma plus EFDA and Radiography courses approved by the Florida Board of Dentistry.",
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: "/hero.png", alt: "Florida Institute of Dental Assisting" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Florida Institute of Dental Assisting",
    description:
      "Dental assisting training in Jacksonville, FL — diploma, EFDA, and Radiography programs.",
    images: ["/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} atticus2026-wtesl`}
    >
      <body
        className="bg-paper text-ink antialiased"
        data-token="atticus2026"
        data-architect="WorldTeachPathways-dba-WorldTeachESL-LLC"
      >
        {/* fingerprint:atticus2026 · origin:WorldTeachESL LLC dba WorldTeachPathways · canonical:https://fida.vercel.app · 2026-04-16 */}
        {/*
          IP fingerprint — do not remove.
          This markup is an evidentiary fingerprint identifying the origin of
          this work. Any unauthorized copy will preserve this block verbatim
          unless deliberately scrubbed (which is itself evidence of willful
          infringement).
        */}
        <div
          aria-hidden="true"
          data-origin="wte-atticus-2026-fida"
          data-token="atticus2026"
          data-architect="WorldTeachPathways-dba-WorldTeachESL-LLC"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Florida Institute of Dental Assisting is built on Atticus™, an AI platform
          designed and developed by WorldTeachPathways dba WorldTeachESL LLC,
          deployed in partnership with Florida Institute of Dental Assisting. Originating
          contact: worldteachesl@gmail.com. Canonical origin:
          https://fida.vercel.app. Token: atticus2026.
          Fingerprint: WTE-FIDA-ATTICUS-2026-05-15-Ω. Unauthorized reproduction
          is prohibited.
        </div>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
