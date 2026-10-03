import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getProspect, logTouch, markVaCall, updateProspect } from "@/lib/prospects-db";
import { displayName } from "@/lib/prospects-shared";
import { CALL_OUTCOMES, teamMember } from "@/lib/pipeline-team";
import { CALENDLY_TOUR_URL } from "@/lib/payment";
import { sendMail } from "@/lib/mail";
import { siteOrigin } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Gated by middleware.ts like every /api/admin/* route.

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

function etStamp(): string {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" })
    .format(new Date())
    .split("-");
  return `${Number(m)}/${Number(d)}/${y.slice(2)}`;
}

const SCRIPT_SYSTEM = (origin: string) => `You write short phone scripts for a virtual assistant calling Florida dentists on behalf of Florida Institute of Dental Assisting (FIDA), a state-licensed dental assisting school in Jacksonville, FL. The goal of the call is to get the dentist (or office manager) to book a 15-minute call with FIDA on Calendly, or to agree to a next step.

What FIDA sells to a dentist — CE for the assistants already in their office. Never invent other facts (no dates, discounts, seat counts, accreditation claims; FIDA is state-licensed, NOT regionally or nationally accredited):
- Radiography for Dental Personnel: $499, coursework online, hands-on capstone done in the dentist's own office under their supervision. Required in Florida before an assistant may expose radiographs. ${origin}/programs/dental-radiography-certification
- Expanded Functions (EFDA): $1,049, online coursework plus capstone in their own office. Lets a dental assistant perform expanded duties under the dentist. ${origin}/programs/efda-certification-florida
- Phone 904-674-3131 · success@fldentalassisting.com · Book: ${CALENDLY_TOUR_URL}

Format — plain text, under 220 words, exactly these labelled sections:
OPENER: two sentences. Who's calling, why, in plain words. Ask for the dentist or office manager by name when one is known.
IF THEY ASK: 3 short bullets answering the likely questions for THIS office, drawn from the notes.
ASK: one sentence that asks for the Calendly booking (offer to send the link by text or email).
VOICEMAIL: two sentences.
QUESTIONS TO RECORD: 3 numbered questions the VA should get answered (e.g. how many assistants, do they expose radiographs now, who decides on training).
No markdown, no brackets, no placeholders.`;

/**
 * POST /api/admin/prospects/[id]/va-call
 *   { action: "script" }                      → { ok, script }
 *   { action: "briefing", said, outcome, callback, to: TeamKey[], followupContact }
 *                                             → { ok, sent: string[], failed: string[] }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const json = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!json) return bad("Bad JSON");
  const p = await getProspect(id);
  if (!p) return bad("Prospect not found.", 404);
  const origin = siteOrigin();
  const who = displayName(p);
  const office = p.current_employer?.trim() || "";

  if (json.action === "script") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return bad("Scripts are offline — missing ANTHROPIC_API_KEY.", 500);
    const facts = [
      `Contact: ${who}`,
      office ? `Practice: ${office}` : "",
      p.city ? `City: ${p.city}` : "",
      p.phone ? `Phone: ${p.phone}` : "",
      p.notes?.trim() ? `Pipeline notes (newest first):\n${p.notes.trim().slice(0, 4000)}` : "No notes yet — this is a first call.",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      const client = new Anthropic({ apiKey });
      const res = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 900,
        system: SCRIPT_SYSTEM(origin),
        messages: [{ role: "user", content: `${facts}\n\nWrite the call script.` }],
      });
      const script = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
      if (!script) return bad("The model returned nothing — try again.", 502);
      return NextResponse.json({ ok: true, script });
    } catch (err) {
      return bad(err instanceof Error ? err.message : "Script failed.", 502);
    }
  }

  if (json.action === "briefing") {
    const said = String(json.said ?? "").trim().slice(0, 6000);
    const outcome = String(json.outcome ?? "").trim();
    const callback = String(json.callback ?? "").trim(); // YYYY-MM-DD or ""
    const toKeys = Array.isArray(json.to) ? (json.to as unknown[]).map(String) : [];
    const followupContact = Boolean(json.followupContact);
    if (!outcome || !(CALL_OUTCOMES as readonly string[]).includes(outcome)) return bad("Pick an outcome.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(callback) && callback !== "") return bad("Bad callback date.");

    // 1) The record: touch + dated line at the top of notes + follow-up date.
    const line = `${etStamp()} VA call — ${outcome}${said ? `: ${said}` : ""}`;
    await logTouch(id, { kind: "call", outcome, body: said || undefined, actor: "va" });
    const prev = p.notes?.trim();
    const upd = await updateProspect(id, {
      notes: prev ? `${line}\n${prev}` : line,
      next_followup_at: callback ? `${callback}T16:00:00.000Z` : null,
    });
    if ("error" in upd) return bad(`Logged the call, but the card did not update: ${upd.error}`, 500);
    await markVaCall(id, outcome);

    // 2) The briefing to the team.
    const subject = `VA call: ${who}${office ? ` — ${office}` : ""} · ${outcome}`;
    const body = [
      `${who}${office ? ` — ${office}` : ""}`,
      p.phone ? `Phone: ${p.phone}` : "",
      p.email ? `Email: ${p.email}` : "",
      "",
      `OUTCOME: ${outcome}`,
      callback ? `CALLBACK / FOLLOW-UP: ${callback}` : "",
      "",
      "WHAT THEY SAID",
      said || "—",
      "",
      `Card: ${origin}/admin/prospects/pipeline`,
    ]
      .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
      .join("\n");
    const sent: string[] = [];
    const failed: string[] = [];
    for (const key of toKeys) {
      const m = teamMember(key);
      if (!m) continue;
      const r = await sendMail({ to: m.email, subject, text: body });
      (r.ok ? sent : failed).push(m.name);
    }

    // 3) Optional short follow-up to the contact with the Calendly link.
    if (followupContact && p.email) {
      const first = (p.first_name?.trim() || who.split(" ")[0] || "there").replace(/^Dr\.?\s*/i, "Dr. ");
      const r = await sendMail({
        to: p.email,
        subject: "Following up on our call — FIDA",
        text: [
          `Hi ${first},`,
          "",
          "Thanks for taking our call today. As promised, here is the link to pick a 15-minute time that suits you to talk about Radiography and Expanded Functions training for your assistants:",
          CALENDLY_TOUR_URL,
          "",
          "Reply to this email any time with questions.",
          "",
          "Debbie & Ashley Sanders",
          "Florida Institute of Dental Assisting",
          "904-674-3131",
        ].join("\n"),
      });
      (r.ok ? sent : failed).push(who);
    }
    return NextResponse.json({ ok: true, sent, failed });
  }

  return bad("Unknown action.");
}
