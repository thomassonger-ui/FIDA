import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Channels and programs accepted by the generator. Mirrors the DB check
// constraints in 20260516_campaign_templates.sql.
const CHANNELS = ["social", "reel", "email", "sms", "yard_sign"] as const;
const PROGRAMS = ["rdp_ce", "efda", "both"] as const;
type Channel = (typeof CHANNELS)[number];
type Program = (typeof PROGRAMS)[number];

type GenerateBody = {
  channel: Channel;
  program: Program;
  goal: string;
  audience?: string;
};

type Variation = {
  subject?: string;
  preview_text?: string;
  body: string;
};

// --- System prompt -------------------------------------------------------

const CHANNEL_BRIEFS: Record<Channel, string> = {
  social: [
    "CHANNEL: Instagram / Facebook feed post.",
    "Length: 80–160 words.",
    "Tone: warm, specific, Jacksonville-local. No corporate-speak. No exclamation overload.",
    "Include 2–4 relevant hashtags at the end (e.g. #JacksonvilleDental #FloridaDentalAssistant).",
    "Open with a hook line, then a short story or detail, then a clear CTA. Mention Atticus chat when natural.",
  ].join("\n"),
  reel: [
    "CHANNEL: Instagram Reel / TikTok caption + 4-beat script.",
    "Output format inside the body field:",
    "  Caption: <1–2 lines>",
    "  Hook (0–2s): <on-screen text>",
    "  Beat 1: <what's shown>",
    "  Beat 2: <what's shown>",
    "  Beat 3: <what's shown>",
    "  CTA (last 2s): <on-screen text>",
    "Tone: real, authentic, peer-to-peer. Picture Ashley or Debbie speaking.",
  ].join("\n"),
  email: [
    "CHANNEL: Email to a prospect or alumni list.",
    "Required fields: subject (under 50 chars), preview_text (under 90 chars), body.",
    "Body: 120–220 words, plain text, 1–3 short paragraphs. Sign off with a line like 'Ashley & Debbie — FIDA'.",
    "Include one clear CTA link placeholder like {{atticus_link}}.",
    "Tone: warm, direct, never pushy. No marketing-speak.",
  ].join("\n"),
  sms: [
    "CHANNEL: SMS / text message.",
    "HARD CAP: 160 characters total in the body. Aim for ~140.",
    "Include first-name placeholder {{first_name}}.",
    "Include a short link placeholder {{atticus_link}}.",
    "End with 'Reply STOP to opt out' ONLY if it fits within 160 chars.",
    "Tone: human, peer-to-peer, never spammy. No emoji unless it materially helps clarity.",
  ].join("\n"),
  yard_sign: [
    "CHANNEL: Yard-sign / poster copy (18x24 or 8.5x11).",
    "Hierarchy: 1 hero line (3–6 words), 1 supporting line (5–10 words), 1 CTA line referencing a QR code.",
    "Output the three lines in body, separated by ' | '. Example: 'Become a Dental Assistant | 5-week EFDA cohort in Jax | Scan the QR — Atticus answers in 30 seconds'.",
  ].join("\n"),
};

const PROGRAM_FACTS: Record<Program, string> = {
  rdp_ce:
    "Radiography for Dental Personnel (RDP-CE) — 6 weeks, fully online, $499. Florida-mandated diploma in dental radiography (FAC 64B5-9.011). Required for any dental personnel operating X-ray equipment in Florida.",
  efda:
    "Expanded Functions for the Dental Assistant (EFDA) — 5 weeks, hybrid (online theory + on-campus lab in Jacksonville), $1,049. Florida Board of Dentistry compliant. Covers sealants, polishing, fluoride, temps, matrices, dam, suture removal, and more.",
  both:
    "FIDA offers two state-licensed programs in Jacksonville: RDP-CE (6 weeks online, $499) and EFDA (5 weeks hybrid, $1,049). Both meet Florida Board requirements.",
};

const SYSTEM_PROMPT_BASE = `You are the marketing copywriter for Florida Institute of Dental Assisting (FIDA), a state-licensed dental assisting school in Jacksonville, FL, operated by WorldTeachPathways dba WorldTeachESL LLC.

You write copy for school owners Ashley Sanders and Debbie Sanders. They are real people. Voice is warm, confident, peer-to-peer. Never pushy. Never corporate-speak. Never make accreditation claims beyond "state-licensed by Florida" — FIDA is NOT regionally or nationally accredited.

Programs you write about:

- Radiography for Dental Personnel (RDP-CE): 6 weeks online, $499, Florida-mandated dental radiography diploma (FAC 64B5-9.011).
- Expanded Functions for the Dental Assistant (EFDA): 5 weeks hybrid, $1,049, Florida Board of Dentistry compliant.

Geography: Jacksonville, FL. Use locally specific references when natural (Beaches, Riverside, San Jose, Atlantic Blvd, etc.) — but never invent specific addresses or partner names.

Output rules (strict):

1. Return JSON ONLY — no preamble, no markdown fences, no commentary.
2. Top-level JSON shape: { "variations": [ { "subject"?: string, "preview_text"?: string, "body": string }, ... ] }
3. Always return exactly 3 variations.
4. Each variation should take a meaningfully different angle (e.g. emotional hook, practical / financial hook, urgency hook) — not three rephrasings of the same idea.
5. Do NOT invent statistics, employer partnerships, alumni quotes, or specific people's names beyond Ashley & Debbie.
6. Do NOT use the words "limited time", "act fast", "don't miss out", or any high-pressure cliché.
7. For SMS variations, the body MUST be 160 characters or fewer. Count carefully.`;

function buildSystemPrompt(channel: Channel, program: Program): string {
  return [
    SYSTEM_PROMPT_BASE,
    "",
    "## Channel brief",
    CHANNEL_BRIEFS[channel],
    "",
    "## Program facts",
    PROGRAM_FACTS[program],
  ].join("\n");
}

function buildUserPrompt(body: GenerateBody): string {
  const parts = [
    `Goal: ${body.goal}.`,
    body.audience ? `Target audience: ${body.audience}.` : null,
    "Write 3 variations following the rules above. Return JSON only.",
  ].filter(Boolean);
  return parts.join("\n");
}

// --- Validation ---------------------------------------------------------

function isChannel(v: unknown): v is Channel {
  return typeof v === "string" && (CHANNELS as readonly string[]).includes(v);
}
function isProgram(v: unknown): v is Program {
  return typeof v === "string" && (PROGRAMS as readonly string[]).includes(v);
}

function parseVariations(text: string): Variation[] {
  // Strip markdown fences if the model adds them anyway.
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model returned non-JSON output.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as { variations?: unknown }).variations)
  ) {
    throw new Error("Model output missing 'variations' array.");
  }

  const raw = (parsed as { variations: unknown[] }).variations;
  const out: Variation[] = [];
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const rec = v as Record<string, unknown>;
    const body = typeof rec.body === "string" ? rec.body.trim() : "";
    if (!body) continue;
    out.push({
      subject: typeof rec.subject === "string" ? rec.subject.trim() : undefined,
      preview_text:
        typeof rec.preview_text === "string"
          ? rec.preview_text.trim()
          : undefined,
      body,
    });
  }
  if (out.length === 0) {
    throw new Error("Model returned no usable variations.");
  }
  return out.slice(0, 3);
}

// --- Route --------------------------------------------------------------

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Generator offline — missing ANTHROPIC_API_KEY." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const body = (await req.json().catch(() => null)) as GenerateBody | null;
    if (!body || !isChannel(body.channel) || !isProgram(body.program)) {
      return new Response(
        JSON.stringify({
          error: "Invalid body. Expected { channel, program, goal, audience? }.",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }
    const goal = (body.goal || "").trim();
    if (!goal) {
      return new Response(
        JSON.stringify({ error: "Goal is required." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }
    const audience = body.audience?.trim() || undefined;

    const systemPrompt = buildSystemPrompt(body.channel, body.program);
    const userPrompt = buildUserPrompt({ ...body, goal, audience });

    const model = "claude-sonnet-4-5";
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model,
      max_tokens: 1800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const variations = parseVariations(text);

    // Log generation (fire-and-forget; failures shouldn't break the response)
    const promptHash = crypto
      .createHash("sha256")
      .update(`${body.channel}|${body.program}|${goal}|${audience ?? ""}`)
      .digest("hex")
      .slice(0, 32);

    void (async () => {
      try {
        const sb = getServerClient();
        await sb.from("campaign_generations").insert({
          channel: body.channel,
          program: body.program,
          goal,
          audience: audience ?? null,
          variations: variations.length,
          model,
          tokens_in: response.usage?.input_tokens ?? null,
          tokens_out: response.usage?.output_tokens ?? null,
          duration_ms: Date.now() - startedAt,
        });
      } catch (err) {
        console.error("[campaigns/generate] log failed:", err);
      }
    })();

    return new Response(
      JSON.stringify({
        variations,
        meta: {
          channel: body.channel,
          program: body.program,
          goal,
          audience,
          model,
          promptHash,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Campaign generator hit an unexpected error.";
    // Best-effort error log
    void (async () => {
      try {
        const sb = getServerClient();
        await sb.from("campaign_generations").insert({
          channel: "unknown",
          program: "unknown",
          goal: "(error)",
          model: "claude-sonnet-4-5",
          duration_ms: Date.now() - startedAt,
          error: message.slice(0, 500),
        });
      } catch {
        // ignore
      }
    })();
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
