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
      else startTransition(() => router.refresh());
    } catch {
      setError("Network error — nothing was promoted.");
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
          {p.current_employer || p.city || p.email || "—"}
        </div>
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
