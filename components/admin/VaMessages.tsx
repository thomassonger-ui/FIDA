"use client";

// Memos to the VA + her "need an answer" questions, on the VA hours card.
//   • Send a memo — it shows on her Atticus time clock for this client; she
//     marks each one read before she clocks in. Read status shows here.
//   • Questions she flagged while working for this client — reply here.
// Saved to Atticus through this site's server route (statement token stays
// server-side).

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface VaMemo {
  id: string;
  body: string;
  author: string;
  created_at: string;
  read_at: string | null;
}
export interface VaQuestion {
  id: string;
  question: string;
  asked_by: string;
  asked_at: string;
  answer: string | null;
  answered_by: string | null;
  answered_at: string | null;
}

const field =
  "w-full rounded-sm border border-rule bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-teal";
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function VaMessages({
  memos,
  questions,
  vaName,
  endpoint,
  onSaved,
}: {
  memos: VaMemo[];
  questions: VaQuestion[];
  vaName: string;
  endpoint: string;
  onSaved?: () => Promise<void> | void;
}) {
  const router = useRouter();
  const first = vaName.split(" ")[0];
  const [memo, setMemo] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(out.error || "Could not save");
      if (onSaved) await onSaved();
      else router.refresh();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const open = questions.filter((q) => !q.answered_at);
  const answered = questions.filter((q) => q.answered_at);

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <div className={`rounded-sm border bg-white p-4 ${open.length ? "border-amber-600" : "border-rule"}`}>
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-xl text-ink">Questions from {first}</h3>
          {open.length > 0 && <span className="text-xs font-semibold text-amber-800">{open.length} need a reply</span>}
        </div>
        {questions.length === 0 && <p className="mt-2 text-sm text-muted">No questions right now.</p>}
        <ul className="mt-2 space-y-3">
          {[...open, ...answered].map((q) => (
            <li key={q.id} className="border-t border-rule pt-2 text-sm first:border-t-0">
              <div className="text-xs text-muted">{when(q.asked_at)} ET</div>
              <p className="font-semibold text-ink">{q.question}</p>
              {q.answered_at ? (
                <p className="mt-0.5 whitespace-pre-line text-muted">
                  <span className="font-semibold text-teal-deep">{q.answered_by}:</span> {q.answer}
                </p>
              ) : (
                <div className="mt-1 flex gap-2">
                  <input
                    className={field}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((x) => ({ ...x, [q.id]: e.target.value }))}
                    placeholder="Your answer"
                  />
                  <button
                    disabled={busy || !(answers[q.id] ?? "").trim()}
                    onClick={() => post({ action: "answer_question", id: q.id, answer: answers[q.id] })}
                    className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-sm border border-rule bg-white p-4">
        <h3 className="font-display text-xl text-ink">Memo to {first}</h3>
        <p className="text-xs text-muted">Shows on her time clock. She marks it read before she starts.</p>
        <textarea
          className={`${field} mt-2 min-h-[64px]`}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="e.g. Skip offices in Tampa this week"
        />
        <button
          disabled={busy || !memo.trim()}
          onClick={async () => {
            if (await post({ action: "post_memo", body: memo })) setMemo("");
          }}
          className="btn-primary mt-2 text-sm px-4 py-1.5 disabled:opacity-50"
        >
          Send memo
        </button>
        {memos.length > 0 && (
          <ul className="mt-3 space-y-2">
            {memos.map((m) => (
              <li key={m.id} className="border-t border-rule pt-2 text-sm">
                <div className="text-xs text-muted">
                  {m.author} · {when(m.created_at)} ET ·{" "}
                  {m.read_at ? <span className="text-teal-deep">Read ✓</span> : <span className="text-amber-800">Not read yet</span>}
                </div>
                <p className="whitespace-pre-line text-ink">{m.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      {err && <p className="text-sm text-red-700 md:col-span-2">{err}</p>}
    </div>
  );
}
