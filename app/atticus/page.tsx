import Link from "next/link";
import { getServerClient } from "@/lib/supabase";
import { headers } from "next/headers";
import InquiryForm from "./inquiry-form";

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
        {/* TOP VIDEO */}
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px", marginBottom: "2.5rem" }}>
          <iframe
            src="https://www.youtube.com/embed/F4sXsc1US5Q"
            title="FIDA admissions"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="eyebrow text-teal-deep">Atticus™M · FIDA admissions</div>
        <h1 className="font-display text-5xl md:text-6xl text-ink mt-3 tracking-tight leading-tight">
          Hi — I&rsquo;m Atticus.
        </h1>
        <p className="font-display text-xl md:text-2xl text-muted mt-4 leading-snug">
          FIDA&rsquo;s AI admissions advisor. Ask me anything about our dental assisting
          programs — tuition, schedules, financial aid, whether your work experience counts.
        </p>

        {/* CALENDLY HANDOFF — primary path */}
        <div className="mt-10 border-2 border-teal bg-paper rounded-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-[220px]">
              <div className="eyebrow text-teal-deep">Talk to Debbie or Ashley</div>
              <p className="font-display text-xl text-ink mt-2 leading-snug">
                Lock in a 15-minute call. Real conversation, no pressure.
              </p>
              <p className="text-sm text-muted mt-2">
                Pick a slot that works — evenings and weekends included. They&rsquo;ll answer
                every question about programs, schedules, and financial aid directly.
              </p>
            </div>
            <a
              href={`https://calendly.com/fldentalassisting/appointment${
                cleanSrc
                  ? `?utm_source=${encodeURIComponent(cleanSrc)}&utm_campaign=atticusm`
                  : "?utm_campaign=atticusm"
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-teal text-white text-sm font-semibold px-5 py-3 rounded-sm hover:bg-teal-deep transition whitespace-nowrap"
            >
              Book a 15-min call →
            </a>
          </div>
        </div>

        {/* OR DIVIDER */}
        <div className="mt-6 flex items-center gap-3 text-xs text-subtle uppercase tracking-eyebrow">
          <div className="flex-1 h-px bg-rule"></div>
          <span>or have us text you back</span>
          <div className="flex-1 h-px bg-rule"></div>
        </div>

        <InquiryForm source={cleanSrc} />

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
