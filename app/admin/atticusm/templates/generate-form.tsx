"use client";

import { useState, useTransition } from "react";

type Channel = "social" | "reel" | "email" | "sms" | "yard_sign";
type Program = "rdp_ce" | "efda" | "both";

type Variation = {
  subject?: string;
  preview_text?: string;
  body: string;
};

type GenerateResponse = {
  variations: Variation[];
  meta: {
    channel: Channel;
    program: Program;
    goal: string;
    audience?: string;
    model: string;
    promptHash: string;
  };
};

const CHANNEL_OPTIONS: { value: Channel; label: string }[] = [
  { value: "social", label: "Social (IG / FB post)" },
  { value: "reel", label: "Reel / TikTok script" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "yard_sign", label: "Yard sign / poster" },
];

const PROGRAM_OPTIONS: { value: Program; label: string }[] = [
  { value: "rdp_ce", label: "Radiography (RDP-CE)" },
  { value: "efda", label: "EFDA" },
  { value: "both", label: "Both programs" },
];

const GOAL_OPTIONS: string[] = [
  "Awareness — introduce FIDA to a new audience",
  "Open-house drive — fill an in-person event",
  "Urgency — seats filling for next cohort",
  "Stalled-app nudge — re-engage incomplete leads",
  "Alumni referral — ask grads for a referral",
  "Cohort kickoff — welcome new students",
  "Recap / UGC — share a student win",
];

function channelLabel(c: Channel): string {
  return CHANNEL_OPTIONS.find((o) => o.value === c)?.label ?? c;
}
function programLabel(p: Program): string {
  return PROGRAM_OPTIONS.find((o) => o.value === p)?.label ?? p;
}

export function GenerateForm({
  saveAction,
}: {
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const [channel, setChannel] = useState<Channel>("social");
  const [program, setProgram] = useState<Program>("both");
  const [goal, setGoal] = useState<string>(GOAL_OPTIONS[0]);
  const [audience, setAudience] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  const [isPendingSave, startSaveTransition] = useTransition();

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedIdx(new Set());
    try {
      const res = await fetch("/api/admin/campaigns/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channel, program, goal, audience: audience || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Generation failed.");
      }
      setResult(data as GenerateResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy(idx: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1400);
    } catch {
      setError("Couldn't copy — browser blocked clipboard access.");
    }
  }

  function onSave(idx: number, v: Variation) {
    if (!result) return;
    const fd = new FormData();
    fd.set("channel", result.meta.channel);
    fd.set("program", result.meta.program);
    fd.set("goal", result.meta.goal);
    if (result.meta.audience) fd.set("audience", result.meta.audience);
    if (v.subject) fd.set("subject", v.subject);
    if (v.preview_text) fd.set("preview_text", v.preview_text);
    fd.set("body", v.body);
    fd.set("prompt_hash", result.meta.promptHash);

    startSaveTransition(async () => {
      try {
        await saveAction(fd);
        setSavedIdx((prev) => new Set(prev).add(idx));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed.");
      }
    });
  }

  const isSms = result?.meta.channel === "sms" || channel === "sms";

  return (
    <div className="border border-rule bg-paper rounded-sm p-5">
      <div className="grid md:grid-cols-12 gap-3">
        <div className="md:col-span-3">
          <label className="eyebrow text-muted">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
          >
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="eyebrow text-muted">Program</label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value as Program)}
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
          >
            {PROGRAM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-6">
          <label className="eyebrow text-muted">Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
          >
            {GOAL_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-9">
          <label className="eyebrow text-muted">Audience (optional)</label>
          <input
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. Career-changing moms · Off-shift CNAs · Beaches retail workers"
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-3 flex items-end">
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="w-full bg-teal text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating…" : "Generate 3 variations"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-4 border-l-4 border-rose-400 bg-rose-50 text-rose-800 text-sm px-4 py-2 rounded-sm">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      {result && (
        <div className="mt-6">
          <div className="text-xs text-subtle mb-3">
            {channelLabel(result.meta.channel)} · {programLabel(result.meta.program)}
            {result.meta.audience ? ` · ${result.meta.audience}` : ""}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.variations.map((v, idx) => {
              const fullText = v.subject
                ? `Subject: ${v.subject}\nPreview: ${v.preview_text ?? ""}\n\n${v.body}`
                : v.body;
              const len = v.body.length;
              const overCap = isSms && len > 160;
              const saved = savedIdx.has(idx);
              return (
                <div
                  key={idx}
                  className="border border-rule rounded-sm p-4 bg-paper-subtle flex flex-col"
                >
                  <div className="eyebrow text-teal-deep mb-2">Variation {idx + 1}</div>
                  {v.subject && (
                    <div className="mb-2">
                      <div className="text-[10px] uppercase tracking-wider text-subtle">Subject</div>
                      <div className="text-sm font-semibold text-ink">{v.subject}</div>
                    </div>
                  )}
                  {v.preview_text && (
                    <div className="mb-2">
                      <div className="text-[10px] uppercase tracking-wider text-subtle">Preview</div>
                      <div className="text-xs text-muted italic">{v.preview_text}</div>
                    </div>
                  )}
                  <div className="text-sm text-ink whitespace-pre-wrap leading-snug flex-1">
                    {v.body}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className={overCap ? "text-rose-700 font-semibold" : "text-subtle"}>
                      {len} chars{isSms ? ` / 160` : ""}
                      {overCap ? " — too long" : ""}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onCopy(idx, fullText)}
                        className="border border-rule text-ink hover:bg-paper px-2 py-1 rounded-sm"
                      >
                        {copiedIdx === idx ? "Copied!" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSave(idx, v)}
                        disabled={saved || isPendingSave}
                        className="bg-teal text-white px-2 py-1 rounded-sm hover:bg-teal-deep disabled:opacity-50"
                      >
                        {saved ? "Saved" : isPendingSave ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[11px] text-subtle">
            Not the right angle? Tweak the goal or audience and hit generate again.
          </div>
        </div>
      )}
    </div>
  );
}
