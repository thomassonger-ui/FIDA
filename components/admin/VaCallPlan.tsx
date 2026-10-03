"use client";

// Floating "VA Call Plan" (bottom-right) on /admin/prospects/pipeline (admin
// pages are gated by middleware.ts). The VA's script for calling dental
// offices: get past the gatekeeper to the office manager or dentist.
// Same plan as the FIDA tab of the Call Plan on tryatticus.com.
// Checkboxes are scratch state for the current call.

import { useState } from "react";

const GOAL = "A meeting with the office manager or dentist";
const OPENER =
  "Hi, this is Jessa with the Florida Institute of Dental Assisting. I'm reaching out to dental offices about training for their assistants: x-ray certification and EFDA. Who handles training or hiring for your assistants?";
const MUST = [
  "Office manager's name, and the dentist's name",
  "Best direct email and phone for the manager",
  "Best day and time to reach the manager or doctor",
];
const MORE = [
  "How many assistants work there?",
  "Are they all radiology-certified?",
  "Any EFDA-trained assistants?",
  "Hiring right now?",
  "Open to a 15-minute call with FIDA?",
];
const GATEKEEPER =
  "\u201CI know the doctor is busy. Who\u2019s the best person to talk to about assistant training?\u201D Get their name and the best time to call back.";
const OBJECTIONS: [string, string][] = [
  ["We train in-house.", "Many offices do. Certification lets your assistants legally take x-rays and do expanded duties."],
  ["Send info.", "Happy to. What's the best email, and who should it go to?"],
];
const CLOSE = "Could [manager/Dr.] do 15 minutes this week or next?";
const BOOK = "https://calendly.com/fldentalassisting";

export function VaCallPlan() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const mustDone = MUST.filter((q) => checked[q]).length;
  const toggle = (q: string) => setChecked((c) => ({ ...c, [q]: !c[q] }));
  const h = "eyebrow text-teal-deep mb-1";

  const Box = ({ q }: { q: string }) => (
    <label className="flex cursor-pointer items-start gap-2 py-1">
      <input type="checkbox" className="mt-0.5" checked={!!checked[q]} onChange={() => toggle(q)} />
      <span className={checked[q] ? "text-muted line-through" : ""}>{q}</span>
    </label>
  );

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-[60] flex max-h-[75vh] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-sm border border-rule bg-white text-sm text-ink shadow-xl">
          <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
            <span className="font-semibold">VA Call Plan · FIDA</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setChecked({})} className="text-xs underline opacity-80 hover:opacity-100">Reset</button>
              <button onClick={() => setOpen(false)} aria-label="Close" className="hover:opacity-80">✕</button>
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto px-4 py-3">
            <p className="rounded-sm bg-teal-50 px-3 py-2 text-xs font-semibold text-teal">Goal: {GOAL}</p>

            <section>
              <h4 className={h}>Opener</h4>
              <p className="italic">&ldquo;{OPENER}&rdquo;</p>
            </section>

            <section className="rounded-sm bg-paper-subtle p-3">
              <h4 className={`${h} flex items-center justify-between`}>
                <span>Must-get ($5 lead)</span>
                <span className={mustDone === MUST.length ? "text-teal-deep" : "text-muted"}>
                  {mustDone}/{MUST.length}
                  {mustDone === MUST.length ? " ✓" : ""}
                </span>
              </h4>
              {MUST.map((q) => <Box key={q} q={q} />)}
            </section>

            <section>
              <h4 className={h}>If it&apos;s going well</h4>
              {MORE.map((q) => <Box key={q} q={q} />)}
            </section>

            <section>
              <h4 className={h}>Gatekeeper</h4>
              <p className="italic">{GATEKEEPER}</p>
            </section>

            <section>
              <h4 className={h}>Objections</h4>
              {OBJECTIONS.map(([o, a]) => (
                <div key={o}>
                  <div className="font-semibold">&ldquo;{o}&rdquo;</div>
                  <div className="text-muted">{a}</div>
                </div>
              ))}
            </section>

            <section>
              <h4 className={h}>Close</h4>
              <p>&ldquo;{CLOSE}&rdquo;</p>
              <a href={BOOK} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-teal underline">
                Open FIDA&apos;s Calendly ↗
              </a>
            </section>

          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-[60] rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-teal"
        aria-expanded={open}
      >
        {open ? "Close plan" : "📋 VA Call Plan"}
      </button>
    </>
  );
}
