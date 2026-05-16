import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { getServerClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MetricRow = {
  category: string;
  metric_key: string;
  label: string;
  value: number | null;
  unit: string | null;
  display_format: string;
  source_name: string | null;
  as_of_date: string | null;
  needs_review: boolean;
  notes: string | null;
};

const SYSTEM_PROMPT = `You are the in-house market analyst for Florida Institute of Dental Assisting (FIDA), a state-licensed dental assisting school in Jacksonville, FL.

You will be given a JSON array of researched market metrics for Duval County / Jacksonville MSA covering dental labor demand, workforce supply, addressable market, the competitive education landscape, and demographics.

Write a 2-paragraph briefing titled implicitly (no header — just paragraphs) addressed to FIDA's owners (Ashley & Debbie Sanders) and to a potential investor reading the same page.

STRICT RULES:

1. Do NOT invent any numbers. Only cite figures present in the provided data. If a relevant metric is missing or its value is null, say so honestly ("we don't yet have a current count of X") rather than estimate.
2. When citing a metric, include the value and unit naturally inline, and reference the source informally — e.g. "BLS pegs Jacksonville dental-assistant median wage at $45,960 (May 2023)".
3. If a metric is flagged needs_review, hedge appropriately ("approximately", "preliminary estimate").
4. Paragraph 1: state of the Jacksonville market — demand vs. supply, wage signal, competitive landscape. ~5 sentences.
5. Paragraph 2: what this means for FIDA specifically — which audiences to recruit, where the financial opportunity sits, where FIDA's $499 RDP-CE and $1,049 EFDA pricing land vs. competitors, what to watch next. ~5 sentences.
6. Voice: confident, plain English, no marketing-speak, no exclamation points, no jargon. The Atticus chat persona's voice — warm, peer-to-peer, but for owners/investors.
7. Maximum ~300 words total.
8. Do not include any headers, bullets, or markdown formatting — plain paragraphs separated by a blank line.`;

export async function POST(_req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Interpreter offline — missing ANTHROPIC_API_KEY." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    // Pull all market signals
    const sb = getServerClient();
    const { data, error } = await sb
      .from("market_signals")
      .select(
        "category, metric_key, label, value, unit, display_format, source_name, as_of_date, needs_review, notes"
      )
      .order("category", { ascending: true })
      .order("display_order", { ascending: true });

    if (error) {
      return new Response(
        JSON.stringify({ error: `Could not load metrics: ${error.message}` }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const rows = (data ?? []) as MetricRow[];
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No market metrics in the DB yet — populate at least a few before generating a brief.",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const populated = rows.filter((r) => r.value != null);
    if (populated.length === 0) {
      return new Response(
        JSON.stringify({
          error: "All metric rows are empty. Fill in at least a few values first.",
        }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // Pass metrics as JSON so the model can reason over them
    const userPrompt = `Here are the current Jacksonville dental-market metrics in our database. Use ONLY these values. Do not invent figures. If you reference a metric, do so naturally inline.

${JSON.stringify(rows, null, 2)}`;

    const model = "claude-sonnet-4-5";
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model,
      max_tokens: 900,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Model returned an empty response." }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        interpretation: text,
        meta: {
          generated_at: new Date().toISOString(),
          metric_count: rows.length,
          populated_count: populated.length,
          model,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Interpreter hit an unexpected error.";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
