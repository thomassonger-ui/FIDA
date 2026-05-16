import Link from "next/link";
import { getServerClient } from "@/lib/supabase";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atticus™M · FIDA",
  description: "Talk to Atticus, FIDA's AI admissions advisor.",
};

/**
 * Public Atticus™M landing.
 *
 * On every visit with a ?src= param, logs a session row so the admin dashboard
 * can count attributed visitors. The chat experience itself is the next phase —
 * for now this captures attribution and surfaces an inquiry CTA.
 */
export default async function AtticusPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  const cleanSrc = (src || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80) || null;

  // Log a session ping (best-effort)
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

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <div className="eyebrow text-teal-deep">Atticus™M · FIDA admissions</div>
        <h1 className="font-display text-5xl md:text-6xl text-ink mt-3 tracking-tight leading-tight">
          Hi — I&rsquo;m Atticus.
        </h1>
        <p className="font-display text-xl md:text-2xl text-muted mt-4 leading-snug">
          FIDA&rsquo;s AI admissions advisor. Ask me anything about our dental assisting
          programs — tuition, schedules, financial aid, whether your work experience counts.
        </p>

        <div className="mt-10 border border-rule bg-paper-subtle rounded-sm p-6">
          <div className="eyebrow text-teal-deep">Talk to a real person</div>
          <p className="font-display text-xl text-ink mt-2 leading-snug">
            Drop your number. Get a text back tonight — even if it&rsquo;s after hours.
          </p>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            Other schools make you fill a form and wait until Monday. Debbie and Ashley
            answer their phones at 9pm because that&rsquo;s when working adults can actually
            talk. No call center. No bot. Just the people who&rsquo;ll teach you.
          </p>
          <Link
            href="/contact"
            className="inline-block mt-4 bg-teal text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal-deep transition"
          >
            Text me back tonight
          </Link>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm">
          <div className="border border-rule bg-paper rounded-sm p-4">
            <div className="font-display text-lg text-ink">Programs</div>
            <p className="text-xs text-muted mt-1">Radiography (RDP-CE) and Expanded Functions Dental Assisting (EFDA).</p>
          </div>
          <div className="border border-rule bg-paper rounded-sm p-4">
            <div className="font-display text-lg text-ink">Schedule</div>
            <p className="text-xs text-muted mt-1">Evening cohorts built for working adults. Next cohort: July 6, 2026.</p>
          </div>
          <div className="border border-rule bg-paper rounded-sm p-4">
            <div className="font-display text-lg text-ink">Instructors</div>
            <p className="text-xs text-muted mt-1">Debbie & Ashley Sanders — co-founders & instructors, 13+ years teaching.</p>
          </div>
        </div>

        {cleanSrc && (
          <p className="text-[11px] text-subtle mt-10 italic">
            Referred from <code className="font-mono">{cleanSrc}</code>. Thanks for checking us out.
          </p>
        )}

        <div className="mt-12 pt-6 border-t border-rule">
          <Link href="/" className="text-sm text-subtle hover:text-ink">
            &larr; Back to FIDA
          </Link>
        </div>
      </div>
    </main>
  );
}
