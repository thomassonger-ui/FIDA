import { headers } from "next/headers";
import { getServerClient } from "@/lib/supabase";
import { AtticusPageContent } from "@/components/landing/AtticusPageContent";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atticus — Start Your Registration",
  description:
    "Start your FIDA registration with Atticus, our AI admissions advisor. Get matched to the Entry Level Dental Assisting diploma program or an EFDA or Radiography course.",
  alternates: { canonical: "/atticus" },
};

/**
 * Public Atticus registration-intake page.
 *
 * Any visit carrying a ?src= param (QR codes, flyers, campaigns) still logs an
 * attribution row so the admin dashboard can count referred visitors — that
 * behaviour predates the 2026-08-09 rebuild and is unchanged. What changed is
 * the page itself: the live chat is now the intake, rather than a CTA that
 * bounced the visitor to /admissions.
 */
export default async function AtticusPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  const cleanSrc =
    (src || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80) || null;

  // Log a session ping (best-effort — never block the page on this)
  if (cleanSrc) {
    try {
      const sb = getServerClient();
      const h = await headers();
      await sb.from("atticus_sessions").insert({
        id: crypto.randomUUID(),
        source: cleanSrc,
        user_agent: (h.get("user-agent") || "").slice(0, 500),
      });
    } catch (err) {
      console.error("[atticus] session log failed:", err);
    }
  }

  return <AtticusPageContent src={cleanSrc} />;
}
