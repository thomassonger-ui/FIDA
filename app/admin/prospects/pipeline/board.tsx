"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TRACK_LABELS,
  TRACK_STAGES,
  stageHelp,
  stageLabel,
  trackOf,
  type Prospect,
  type Stage,
  type Track,
} from "@/lib/prospects-shared";

function name(p: Prospect) {
  if (p.full_name?.trim()) return p.full_name.trim();
  const j = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return j || p.email || "—";
}

function overdue(p: Prospect) {
  return Boolean(
    p.next_followup_at && new Date(p.next_followup_at).getTime() < Date.now()
  );
}

function daysSinceTouch(p: Prospect): number | null {
  if (!p.last_touch_at) return null;
  return Math.floor(
    (Date.now() - new Date(p.last_touch_at).getTime()) / 86_400_000
  );
}

export function Board({
  prospects,
  identified,
  defaultTrack = "employer",
}: {
  prospects: Prospect[];
  /** Count of stage=identified rows per track — they are not loaded as cards. */
  identified: Record<Track, number>;
  defaultTrack?: Track;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<"board" | "table">("board");
  const [track, setTrack] = useState<Track>(defaultTrack);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Replied dialog
  const [replyFor, setReplyFor] = useState<Prospect | null>(null);
  const [replyText, setReplyText] = useState("");
  const [draft, setDraft] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function openReply(p: Prospect) {
    setReplyFor(p);
    setReplyText("");
    setDraft("");
    setDraftError(null);
    setCopied(false);
  }

  async function draftResponse() {
    if (!replyFor || !replyText.trim()) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${replyFor.id}/reply-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      const json = await res.json();
      if (!json.ok) setDraftError(json.error ?? "Could not draft a response.");
      else {
        setDraft(json.draft);
        setCopied(false);
      }
    } catch {
      setDraftError("Network error — no draft.");
    } finally {
      setDrafting(false);
    }
  }

  const STAGES = TRACK_STAGES[track];
  const byStage: Record<string, Prospect[]> = {};
  for (const s of STAGES) byStage[s] = [];
  for (const p of prospects) {
    if (p.removed_at || p.stage === "lost" || trackOf(p) !== track) continue;
    if (byStage[p.stage]) byStage[p.stage].push(p);
  }

  async function move(id: string, stage: Stage) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id], action: "stage", stage }),
      });
      const json = await res.json();
      if (!json.ok) setError(json.error ?? "Could not move that card.");
      else startTransition(() => router.refresh());
    } catch {
      setError("Network error — the card did not move.");
    } finally {
      setBusyId(null);
    }
  }

  async function promote(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = await res.json();
      if (!json.ok) setError(json.error ?? "Could not promote.");
      else {
        if (typeof json.agreement === "string" && json.agreement.startsWith("failed"))
          setError(`Promoted, but the enrollment agreement email ${json.agreement} — re-send it from the student page.`);
        startTransition(() => router.refresh());
      }
    } catch {
      setError("Network error — nothing was promoted.");
    } finally {
      setBusyId(null);
    }
  }

  /**
   * Logs the reply as a touch (with their words, if pasted), pauses a running
   * drip, and moves a dentist to Interested — a reply is what Interested means.
   */
  async function replied(p: Prospect, theirReply: string) {
    setBusyId(p.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${p.id}/touch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "email",
          outcome: "replied",
          body: theirReply.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "Could not log the reply.");
        return;
      }
      if (p.drip_status === "active")
        await fetch("/api/admin/prospects/drip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "pause", ids: [p.id] }),
        });
      if (track === "employer" && (p.stage === "identified" || p.stage === "nurture"))
        await move(p.id, "applied");
      else startTransition(() => router.refresh());
    } catch {
      setError("Network error — the reply was not logged.");
    } finally {
      setBusyId(null);
    }
  }

  const Card = ({ p }: { p: Prospect }) => {
    const stale = daysSinceTouch(p);
    const idx = STAGES.indexOf(p.stage as (typeof STAGES)[number]);
    const next = idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
    return (
      <div
        className={`border rounded-sm bg-paper px-3 py-2.5 text-sm ${
          overdue(p) ? "border-red-300" : "border-rule"
        } ${busyId === p.id ? "opacity-50" : ""}`}
      >
        <div className="font-medium text-navy leading-tight">{name(p)}</div>
        <div className="text-xs text-muted mt-0.5 truncate">
          {p.current_employer || p.city || "—"}
        </div>
        {p.email && (
          <a
            href={`mailto:${p.email}`}
            className="block mt-1 text-xs text-teal underline truncate"
          >
            {p.email}
          </a>
        )}
        {p.phone && (
          <a href={`tel:${p.phone}`} className="block text-xs text-ink tabular-nums">
            {p.phone}
          </a>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-subtle tabular-nums">
            {stale === null
              ? "no touch yet"
              : stale === 0
                ? "touched today"
                : `${stale}d since touch`}
          </span>
          {overdue(p) && (
            <span className="text-[10px] uppercase tracking-wider text-red-700 font-semibold">
              overdue
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <select
            aria-label="Stage"
            value={p.stage}
            disabled={busyId === p.id}
            onChange={(e) => {
              const s = e.target.value as Stage;
              if (s === p.stage) return;
              if (s === "registered" && track === "student") promote(p.id);
              else move(p.id, s);
            }}
            className="text-xs border border-rule rounded-sm bg-paper px-1.5 py-1 text-ink"
          >
            {STAGES.filter((s) => s !== "identified").map((s) => (
              <option key={s} value={s}>
                {stageLabel(track, s)}
              </option>
            ))}
            <option value="lost">Lost</option>
          </select>
          <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => openReply(p)}
            className="text-xs font-semibold text-teal underline disabled:opacity-40"
          >
            Replied
          </button>
          {p.email && (
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(p.email)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-rule text-muted hover:border-teal hover:text-teal"
            >
              Gmail
            </a>
          )}
        </div>
        <div className="mt-2 flex gap-1.5">
          {p.stage === "applied" && track === "student" ? (
            <button
              type="button"
              disabled={busyId === p.id}
              onClick={() => promote(p.id)}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-teal text-white hover:bg-teal-deep disabled:opacity-40"
              title="Marks Registered and creates the student record"
            >
              Registered → Student
            </button>
          ) : next ? (
            <button
              type="button"
              disabled={busyId === p.id}
              onClick={() => move(p.id, next)}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-rule text-muted hover:border-teal hover:text-teal disabled:opacity-40"
            >
              → {stageLabel(track, next)}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => move(p.id, "lost")}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-rule text-subtle hover:border-red-300 hover:text-red-700 disabled:opacity-40"
          >
            Lost
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {replyFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Replied — ${name(replyFor)}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setReplyFor(null);
          }}
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl leading-snug">
                Replied — {name(replyFor)}
              </h2>
              <button
                type="button"
                onClick={() => setReplyFor(null)}
                aria-label="Close"
                className="text-muted hover:text-ink text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              Marks them replied and ends any remaining drip emails
              {track === "employer"
                ? `, and moves the card to ${stageLabel(track, "applied")} (unless it's already further along)`
                : ""}
              . Paste their reply to save it on the card — and to let Claude
              draft your response. Nothing sends automatically; you copy the
              draft into Gmail.
            </p>

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">
              Their reply (optional, needed for a draft)
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              placeholder="Paste what they wrote…"
              className="mt-1 w-full border border-rule rounded-md bg-paper p-3 text-sm"
            />

            {draft && (
              <>
                <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">
                  Draft response — edit before you send
                </label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={10}
                  className="mt-1 w-full border border-rule rounded-md bg-paper p-3 text-sm"
                />
                <div className="mt-2 flex gap-3 text-xs">
                  <button
                    type="button"
                    className="text-teal underline font-semibold"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(draft);
                        setCopied(true);
                      } catch {
                        setDraftError("Could not copy — select the text and copy it by hand.");
                      }
                    }}
                  >
                    {copied ? "Copied" : "Copy draft"}
                  </button>
                  {replyFor.email && (
                    <a
                      className="text-teal underline font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        replyFor.email
                      )}&body=${encodeURIComponent(draft)}`}
                    >
                      Open in Gmail
                    </a>
                  )}
                </div>
              </>
            )}
            {draftError && <p className="mt-2 text-xs text-amber-800">{draftError}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setReplyFor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-outline disabled:opacity-40"
                disabled={drafting || !replyText.trim()}
                onClick={draftResponse}
              >
                {drafting ? "Drafting…" : draft ? "Redraft" : "Draft response"}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-40"
                disabled={busyId === replyFor.id}
                onClick={async () => {
                  const p = replyFor;
                  await replied(p, replyText);
                  setReplyFor(null);
                }}
              >
                Mark replied
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-8 flex items-center gap-2 flex-wrap">
        {(["employer", "student"] as Track[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTrack(t)}
            className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm border ${
              track === t
                ? "bg-teal text-white border-teal"
                : "border-rule text-ink hover:border-teal"
            }`}
          >
            {TRACK_LABELS[t]}
          </button>
        ))}
        <span className="h-5 w-px bg-rule mx-1" aria-hidden />
        <button
          type="button"
          onClick={() => setView("board")}
          className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm border ${
            view === "board"
              ? "bg-ink text-paper border-ink"
              : "border-rule text-ink hover:border-ink"
          }`}
        >
          Board
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm border ${
            view === "table"
              ? "bg-ink text-paper border-ink"
              : "border-rule text-ink hover:border-ink"
          }`}
        >
          Table
        </button>
        {pending && <span className="text-xs text-muted">Refreshing…</span>}
        {error && <span className="text-xs text-amber-800">{error}</span>}
      </div>

      {view === "board" ? (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-4">
          {STAGES.map((s) => (
            <div key={s} className="w-64 shrink-0">
              <div className="flex items-baseline justify-between px-1 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  {stageLabel(track, s)}
                </span>
                <span className="text-xs tabular-nums text-ink">
                  {s === "identified" ? identified[track].toLocaleString() : byStage[s].length}
                </span>
              </div>
              <p className="px-1 mb-2 text-[10px] leading-snug text-subtle">
                {stageHelp(track, s)}
              </p>
              <div className="space-y-2 min-h-[80px] bg-ink/[0.02] border border-rule/60 rounded-sm p-2">
                {s === "identified" ? (
                  <div className="text-xs text-muted text-center py-4 px-2">
                    {identified[track].toLocaleString()} on the list. Pick them in{" "}
                    <a href="/admin/prospects" className="text-teal underline">
                      Prospects
                    </a>{" "}
                    — starting the drip or moving them to {stageLabel(track, "nurture")} brings them here.
                  </div>
                ) : byStage[s].length === 0 ? (
                  <div className="text-xs text-muted text-center py-4">—</div>
                ) : (
                  byStage[s].map((p) => <Card key={p.id} p={p} />)
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-rule rounded-sm bg-paper overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle">
              <tr className="border-b border-rule text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Stage</th>
                <th className="px-3 py-3 font-semibold">Last touch</th>
                <th className="px-3 py-3 font-semibold">Next follow-up</th>
                <th className="px-3 py-3 font-semibold">Touches</th>
              </tr>
            </thead>
            <tbody>
              {STAGES.flatMap((s) => byStage[s]).map((p) => {
                const stale = daysSinceTouch(p);
                return (
                  <tr
                    key={p.id}
                    className="border-t border-rule hover:bg-paper-subtle/40"
                  >
                    <td className="px-3 py-3 font-medium text-navy">
                      {name(p)}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {stageLabel(track, p.stage)}
                    </td>
                    <td className="px-3 py-3 text-muted tabular-nums">
                      {stale === null ? "—" : `${stale}d ago`}
                    </td>
                    <td
                      className={`px-3 py-3 tabular-nums ${
                        overdue(p) ? "text-red-700 font-semibold" : "text-muted"
                      }`}
                    >
                      {p.next_followup_at
                        ? new Date(p.next_followup_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted">
                      {p.touch_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
