import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Blueprint School Institute",
    template: "%s | Blueprint School Institute",
  },
  description:
    "A modern allied-health institute powered by Atticus. Clinical-ready programs in Medical Assisting, Medical Billing & Coding, and Patient Care Technology.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
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
        {/* fingerprint:atticus2026 · origin:WorldTeachESL LLC dba WorldTeachPathways · canonical:https://blueprint-school.vercel.app · 2026-04-16 */}
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
          Blueprint School Institute is built on Atticus™, an AI platform
          designed and developed by WorldTeachPathways dba WorldTeachESL LLC,
          deployed in partnership with Cole Middleton Advisors. Originating
          contact: worldteachesl@gmail.com. Canonical origin:
          https://blueprint-school.vercel.app. Token: atticus2026.
          Fingerprint: WTE-FIDA-ATTICUS-2026-05-15-Ω. Unauthorized reproduction
          is prohibited.
        </div>
        {children}
      </body>
    </html>
  );
}
