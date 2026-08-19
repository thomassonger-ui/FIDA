"use client";

import Link from "next/link";
import { useState } from "react";

/* ------------------------------------------------------------------ *
 * Flyer generator — Atticus™M
 * Lets the owner spin up a print-ready flyer on the fly: pick an
 * audience preset, edit the copy, choose which Summer 2026 cohorts to
 * feature, then Print / Save as PDF. Only the .flyer-sheet prints.
 *
 * Compliance (locked): EFDA + Radiography are professional-development
 * courses APPROVED BY THE FLORIDA BOARD OF DENTISTRY. The Entry Level
 * Dental Assisting diploma is LICENSED BY THE FLORIDA COMMISSION FOR
 * INDEPENDENT EDUCATION (CIE). Never mix the two. No financial-aid or
 * "nationally recognized" claims.
 * ------------------------------------------------------------------ */

type ProgramKey = "efda" | "radiography" | "diploma";

type Program = {
  key: ProgramKey;
  name: string;
  blurb: string;
  approval: string;
};

const PROGRAMS: Program[] = [
  {
    key: "efda",
    name: "EFDA Certification",
    blurb:
      "Expanded Functions for the Dental Assistant. Hybrid — study online, finish the clinical capstone at your own practice.",
    approval: "Approved by the Florida Board of Dentistry",
  },
  {
    key: "radiography",
    name: "Dental Radiography Certification",
    blurb:
      "Florida-mandated dental radiography certification (FAC 64B5-9.011). Online coursework with an in-office clinical capstone.",
    approval: "Approved by the Florida Board of Dentistry",
  },
  {
    key: "diploma",
    name: "Entry Level Dental Assisting Diploma",
    blurb:
      "Jacksonville-based diploma program for those starting their dental-assisting career.",
    approval: "Licensed by the Florida Commission for Independent Education",
  },
];

type Preset = {
  id: string;
  label: string;
  eyebrow: string;
  headline: string;
  subhead: string;
  cta: string;
};

const PRESETS: Preset[] = [
  {
    id: "offices",
    label: "Dentist offices",
    eyebrow: "For Jacksonville dental offices",
    headline: "Sample the programs.",
    subhead:
      "Give your team a path to advance. Your assistants can earn EFDA and Radiography certification this summer — online coursework, with the clinical capstone finished right in your office.",
    cta: "Sample the programs",
  },
  {
    id: "breakroom",
    label: "Break-room flyer",
    eyebrow: "Posted in your staff lounge",
    headline: "Ready to credential up?",
    subhead:
      "You already know the work. This summer, turn it into a certification — on a schedule that fits around your shifts.",
    cta: "See summer cohorts",
  },
  {
    id: "career",
    label: "Career changers",
    eyebrow: "Start a career in dentistry",
    headline: "Your summer to start.",
    subhead:
      "Train to become a dental assistant in Jacksonville. Hybrid schedules built for working adults — keep your job while you learn.",
    cta: "Explore the programs",
  },
];

const TEAL = "#2CB1BC";

export default function FlyerBuilderPage() {
  const [presetId, setPresetId] = useState("offices");
  const preset = PRESETS.find((p) => p.id === presetId)!;

  const [eyebrow, setEyebrow] = useState(preset.eyebrow);
  const [headline, setHeadline] = useState(preset.headline);
  const [subhead, setSubhead] = useState(preset.subhead);
  const [cohort, setCohort] = useState("Fall 2026 · Starts September 15, 2026");
  const [cta, setCta] = useState(preset.cta);
  const [url, setUrl] = useState("fldentalassisting.com");
  const [contact, setContact] = useState("Jacksonville, FL · fldentalassisting.com");
  // QR goes DIRECT to the Google review page (per Tom 2026-08-18) — no
  // redirect hop, no database dependency. Editable per-flyer in the form.
  const [qrUrl, setQrUrl] = useState("https://g.page/r/CR2PNAbFB2UqEAI/review");
  const [selected, setSelected] = useState<ProgramKey[]>(["efda", "radiography"]);

  function applyPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id)!;
    setPresetId(id);
    setEyebrow(p.eyebrow);
    setHeadline(p.headline);
    setSubhead(p.subhead);
    setCta(p.cta);
  }

  function toggle(key: ProgramKey) {
    setSelected((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]
    );
  }

  const chosen = PROGRAMS.filter((p) => selected.includes(p.key));
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrUrl)}`;

  return (
    <div>
      {/* print rules — hide the app chrome, show only the sheet */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .flyer-sheet, .flyer-sheet * { visibility: visible !important; }
          .flyer-sheet {
            position: absolute; left: 0; top: 0; width: 100%;
            box-shadow: none !important; border: none !important; margin: 0 !important;
          }
          @page { size: letter portrait; margin: 0.5in; }
        }
      `}</style>

      {/* header */}
      <div className="flex items-start justify-between gap-4 flex-wrap no-print">
        <div>
          <div className="eyebrow mb-2">Atticus™M · Flyer builder</div>
          <h1 className="font-display text-4xl text-ink tracking-tight">Sample the programs</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Build a print-ready flyer on the fly. Pick an audience, tweak the copy, choose
            which Summer 2026 cohorts to feature, then Print or Save as PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-block bg-teal text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal-deep transition"
          >
            Print / Save as PDF
          </button>
          <Link
            href="/admin/atticusm"
            className="inline-block border border-rule text-muted text-sm font-semibold px-4 py-2 rounded-sm hover:text-ink transition"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[340px_1fr] gap-8 items-start">
        {/* ---------------- CONTROLS ---------------- */}
        <div className="no-print space-y-6">
          <div>
            <div className="eyebrow mb-2">Audience preset</div>
            <div className="flex flex-col gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`text-left text-sm px-3 py-2 rounded-sm border transition ${
                    presetId === p.id
                      ? "border-teal bg-teal/10 text-teal-deep font-semibold"
                      : "border-rule text-muted hover:text-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="eyebrow mb-2">Programs to feature</div>
            <div className="flex flex-col gap-2">
              {PROGRAMS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-start gap-2 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.key)}
                    onChange={() => toggle(p.key)}
                    className="mt-1 accent-teal"
                  />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <Field label="Eyebrow" value={eyebrow} onChange={setEyebrow} />
          <Field label="Headline" value={headline} onChange={setHeadline} />
          <Field label="Subhead" value={subhead} onChange={setSubhead} textarea />
          <Field label="Cohort line" value={cohort} onChange={setCohort} />
          <Field label="Call to action" value={cta} onChange={setCta} />
          <Field label="URL" value={url} onChange={setUrl} />
          <Field label="QR destination (link)" value={qrUrl} onChange={setQrUrl} />
          <Field label="Contact line" value={contact} onChange={setContact} />
        </div>

        {/* ---------------- PREVIEW (the printable sheet) ---------------- */}
        <div className="bg-paper-subtle rounded-sm p-6 overflow-auto">
          <div
            className="flyer-sheet bg-white mx-auto shadow-card"
            style={{ width: "8.5in", minHeight: "11in", padding: "0.7in", boxSizing: "border-box" }}
          >
            {/* brand row */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", borderBottom: `3px solid ${TEAL}`, paddingBottom: "18px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fida-logo.png" alt="FIDA" style={{ height: "64px", width: "auto" }} />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#0B2545", lineHeight: 1.1 }}>
                  Florida Institute of Dental Assisting
                </div>
                <div style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: TEAL, fontWeight: 600, marginTop: "2px" }}>
                  Jacksonville, Florida
                </div>
              </div>
            </div>

            {/* headline block */}
            <div style={{ marginTop: "44px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: TEAL, fontWeight: 700 }}>
                {eyebrow}
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "52px", lineHeight: 1.05, color: "#0B2545", margin: "12px 0 0", letterSpacing: "-0.01em" }}>
                {headline}
              </h2>
              <p style={{ fontSize: "16px", lineHeight: 1.6, color: "#3a4a5a", marginTop: "18px", maxWidth: "6.2in" }}>
                {subhead}
              </p>
            </div>

            {/* cohort banner */}
            <div style={{ marginTop: "30px", display: "inline-block", background: "#0B2545", color: "white", fontSize: "14px", fontWeight: 600, padding: "8px 16px", borderRadius: "4px" }}>
              {cohort}
            </div>

            {/* program cards */}
            <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: chosen.length > 1 ? "1fr 1fr" : "1fr", gap: "16px" }}>
              {chosen.map((p) => (
                <div key={p.key} style={{ border: "1px solid #e3e8ee", borderRadius: "6px", padding: "18px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "#0B2545", lineHeight: 1.15 }}>
                    {p.name}
                  </div>
                  <p style={{ fontSize: "13px", lineHeight: 1.5, color: "#3a4a5a", marginTop: "8px" }}>{p.blurb}</p>
                  <div style={{ fontSize: "11px", color: TEAL, fontWeight: 600, marginTop: "10px" }}>{p.approval}</div>
                </div>
              ))}
              {chosen.length === 0 && (
                <div style={{ fontSize: "13px", color: "#8a97a5", fontStyle: "italic" }}>
                  Select at least one program to feature.
                </div>
              )}
            </div>

            {/* CTA + QR */}
            <div style={{ marginTop: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "inline-block", background: TEAL, color: "white", fontSize: "18px", fontWeight: 700, padding: "12px 24px", borderRadius: "6px" }}>
                  {cta} →
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "#0B2545", marginTop: "10px" }}>{url}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="Scan to learn more" width={120} height={120} style={{ display: "block", border: "1px solid #e3e8ee", borderRadius: "6px" }} />
                <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, fontWeight: 600, marginTop: "6px" }}>Scan to learn more</div>
              </div>
            </div>

            {/* footer */}
            <div style={{ position: "relative", marginTop: "48px", paddingTop: "16px", borderTop: "1px solid #e3e8ee", fontSize: "11px", color: "#8a97a5" }}>
              {contact}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full text-sm border border-rule rounded-sm px-3 py-2 text-ink focus:border-teal focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm border border-rule rounded-sm px-3 py-2 text-ink focus:border-teal focus:outline-none"
        />
      )}
    </label>
  );
}
