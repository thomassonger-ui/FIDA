"use client";

import { useState } from "react";

type InterpretResponse = {
  interpretation: string;
  meta: { generated_at: string; metric_count: number; model: string };
};

export function Interpretation() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [meta, setMeta] = useState<InterpretResponse["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/market/interpret", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Interpretation failed.");
      setText((data as InterpretResponse).interpretation);
      setMeta((data as InterpretResponse).meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Interpretation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  }

  return (
    <div className="border-l-4 border-teal bg-teal-50 rounded-sm p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="eyebrow text-teal-deep">What this means for FIDA</div>
          <div className="text-xs text-muted mt-1">
            AI brief built from the metric values below. Numbers cited come straight from
            the table — none are invented.
          </div>
        </div>
        <div className="flex gap-2">
          {text && (
            <button
              type="button"
              onClick={onCopy}
              className="border border-rule bg-paper text-ink text-xs font-semibold px-3 py-1.5 rounded-sm hover:bg-paper-subtle transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="bg-teal text-white text-xs font-semibold px-3 py-1.5 rounded-sm hover:bg-teal-deep transition disabled:opacity-50"
          >
            {loading ? "Generating…" : text ? "Regenerate" : "Generate brief"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 border-l-4 border-rose-400 bg-rose-50 text-rose-800 text-sm px-3 py-2 rounded-sm">
          {error}
        </div>
      )}

      {!text && !loading && !error && (
        <div className="mt-4 text-sm text-muted italic">
          Click &ldquo;Generate brief&rdquo; for a 2-paragraph read on what the current
          metrics say about FIDA&rsquo;s market position.
        </div>
      )}

      {text && (
        <div className="mt-4">
          <div className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{text}</div>
          {meta && (
            <div className="text-[11px] text-subtle mt-3">
              Built from {meta.metric_count} metrics ·{" "}
              {new Date(meta.generated_at).toLocaleString("en-US")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
