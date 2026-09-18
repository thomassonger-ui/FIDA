import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getProspect } from "@/lib/prospects-db";
import { displayName, trackOf } from "@/lib/prospects-shared";
import { siteOrigin } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Gated by middleware.ts like every /api/admin/* route.

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

const SYSTEM = (origin: string) => `You draft email replies for Florida Institute of Dental Assisting (FIDA), a state-licensed dental assisting school in Jacksonville, FL. A person on the recruiting list has replied to FIDA's outreach; write the response a staff member will review, edit and send from Gmail themselves.

Facts you may use — never invent others (no dates, discounts, seat counts, accreditation claims; FIDA is state-licensed, NOT regionally or nationally accredited):
- Radiography for Dental Personnel: $499, coursework online, hands-on capstone done in the dentist's own office under their supervision. ${origin}/programs/dental-radiography-certification
- Expanded Functions (EFDA): $1,049, online coursework plus capstone. ${origin}/programs/efda-certification-florida
- Entry Level Dental Assisting diploma: $9,700 tuition + $150 registration; interest-free in-house financing. ${origin}/tuition
- Questions any hour: Atticus, the AI admission advisor, at ${origin}/admissions
- Phone 904-674-3131 · success@fldentalassisting.com

Rules:
- Answer what they actually asked, first. If you don't have the fact, say a real person will follow up with it — do not guess.
- If they ask to stop or are not interested, write a two-line gracious close and nothing else.
- Warm, direct, peer-to-peer. No marketing-speak, no exclamation marks. Under 130 words.
- Plain text only. No subject line, no markdown, no placeholders in brackets.
- Sign off exactly:
Debbie & Ashley Sanders
Florida Institute of Dental Assisting
904-674-3131`;

/** POST /api/admin/prospects/[id]/reply-draft  { reply } → { ok, draft } */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return bad("Drafting is offline — missing ANTHROPIC_API_KEY.", 500);

  const json = (await req.json().catch(() => null)) as { reply?: string } | null;
  const reply = (json?.reply ?? "").trim().slice(0, 6000);
  if (!reply) return bad("Paste their reply first.");

  const p = await getProspect(id);
  if (!p) return bad("Prospect not found.", 404);

  const employer = trackOf(p) === "employer";
  const who = [
    `Name: ${displayName(p)}`,
    employer
      ? "They are a Florida dentist / practice owner. FIDA's pitch to them is CE (Radiography, EFDA) for their assistants. Address them as Dr. <last name> when a last name is known."
      : "They are a prospective student for the Entry Level Dental Assisting diploma.",
    p.current_employer ? `Practice / employer: ${p.current_employer}` : "",
    p.city ? `City: ${p.city}` : "",
    p.program_interest ? `Program interest: ${p.program_interest}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 700,
      system: SYSTEM(siteOrigin()),
      messages: [
        {
          role: "user",
          content: `${who}\n\nTheir reply:\n"""\n${reply}\n"""\n\nWrite the response email body.`,
        },
      ],
    });
    const draft = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    if (!draft) return bad("The model returned nothing — try again.", 502);
    return NextResponse.json({ ok: true, draft });
  } catch (err) {
    return bad(err instanceof Error ? err.message : "Draft failed.", 502);
  }
}
