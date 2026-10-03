"use client";

import { useState } from "react";

export function AnswerForm({ token }: { token: string }) {
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/memo/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const json = await res.json();
      if (!json.ok) setError(json.error ?? "Could not save.");
      else setDone(true);
    } catch {
      setError("Network error — not saved.");
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="mt-6 border border-teal/40 bg-teal/5 rounded-md p-4 text-sm text-ink">
        Saved. It&rsquo;s on the card&rsquo;s notes and the sender has been emailed. You can close this page.
      </div>
    );

  return (
    <div className="mt-6">
      <label className="block text-[10px] uppercase tracking-wider text-muted">
        What happened — one line is enough
      </label>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        placeholder='e.g. "Called — wants a proposal by Friday"'
        className="mt-1 w-full border border-rule rounded-md bg-paper p-3 text-sm"
      />
      {error && <p className="mt-2 text-xs text-amber-800">{error}</p>}
      <button
        type="button"
        disabled={busy || !answer.trim()}
        onClick={submit}
        className="mt-3 px-4 py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-40"
      >
        {busy ? "Saving…" : "Send answer"}
      </button>
    </div>
  );
}
