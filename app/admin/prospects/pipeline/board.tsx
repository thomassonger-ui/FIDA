"use client";

import { useRef, useState, useTransition } from "react";
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
import { CALL_OUTCOMES, PIPELINE_TEAM, teamMember, type TeamKey } from "@/lib/pipeline-team";
import type { MemoRow } from "@/lib/prospect-memos";

const CALENDLY_URL = "https://calendly.com/fldentalassisting";

type Recog = { start(): void; stop(): void; onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; continuous: boolean; interimResults: boolean; lang: string };

function name(p: Prospect) {
  if (p.full_name?.trim()) return p.full_name.trim();
  const j = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return j || p.email || "—";
}

/** Calendar day (YYYY-MM-DD) in Eastern time — follow-ups are dates, not instants. */
function etDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(d);
}

/** Days from today (ET) to the follow-up date; negative = overdue. Null = none set. */
function followupDays(p: Prospect): number | null {
  if (!p.next_followup_at) return null;
  const [y1, m1, d1] = etDay(new Date()).split("-").map(Number);
  const [y2, m2, d2] = etDay(new Date(p.next_followup_at)).split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

function overdue(p: Prospect) {
  const d = followupDays(p);
  return d !== null && d < 0;
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
  openMemos = [],
  defaultTrack = "employer",
}: {
  prospects: Prospect[];
  /** Count of stage=identified rows per track — they are not loaded as cards. */
  identified: Record<Track, number>;
  /** Unanswered memos — drives the "memo open" badge on cards. */
  openMemos?: MemoRow[];
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
  // Notes dialog + which cards have their notes expanded
  const [notesFor, setNotesFor] = useState<Prospect | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // VA call dialog
  const [vaFor, setVaFor] = useState<Prospect | null>(null);
  const [vaScript, setVaScript] = useState("");
  const [vaScripting, setVaScripting] = useState(false);
  const [vaSaid, setVaSaid] = useState("");
  const [vaOutcome, setVaOutcome] = useState("");
  const [vaCallback, setVaCallback] = useState("");
  const [vaTo, setVaTo] = useState<Set<TeamKey>>(new Set());
  const [vaFollowupContact, setVaFollowupContact] = useState(false);
  const [vaSending, setVaSending] = useState(false);
  const [vaError, setVaError] = useState<string | null>(null);
  const [vaCopied, setVaCopied] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<Recog | null>(null);

  function openVa(p: Prospect) {
    setVaFor(p);
    setVaScript("");
    setVaSaid("");
    setVaOutcome("");
    setVaCallback("");
    setVaTo(new Set(PIPELINE_TEAM.filter((m) => m.defaultOn).map((m) => m.key)));
    setVaFollowupContact(false);
    setVaError(null);
    setVaCopied(false);
  }

  async function getScript() {
    if (!vaFor) return;
    setVaScripting(true);
    setVaError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${vaFor.id}/va-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "script" }),
      });
      const json = await res.json();
      if (!json.ok) setVaError(json.error ?? "Could not build a script.");
      else setVaScript(json.script);
    } catch {
      setVaError("Network error — no script.");
    } finally {
      setVaScripting(false);
    }
  }

  function toggleDictation() {
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const w = window as unknown as { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setVaError("Dictation needs Chrome or Safari.");
      return;
    }
    const r = new Ctor();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      let add = "";
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) add += e.results[i][0].transcript + " ";
      if (add) setVaSaid((cur) => (cur ? cur.replace(/\s*$/, " ") : "") + add.trim());
    };
    r.onend = () => {
      setListening(false);
      recogRef.current = null;
    };
    recogRef.current = r;
    setListening(true);
    r.start();
  }

  async function sendBriefing() {
    if (!vaFor) return;
    if (!vaOutcome) {
      setVaError("Pick an outcome.");
      return;
    }
    setVaSending(true);
    setVaError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${vaFor.id}/va-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "briefing",
          said: vaSaid,
          outcome: vaOutcome,
          callback: vaCallback,
          to: [...vaTo],
          followupContact: vaFollowupContact,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setVaError(json.error ?? "Could not send the briefing.");
        return;
      }
      if (Array.isArray(json.failed) && json.failed.length)
        setError(`Call logged. Email did not reach: ${json.failed.join(", ")}.`);
      setVaFor(null);
      startTransition(() => router.refresh());
    } catch {
      setVaError("Network error — nothing was sent.");
    } finally {
      setVaSending(false);
    }
  }

  // Memo dialog
  const [memoFor, setMemoFor] = useState<Prospect | null>(null);
  const [memoFrom, setMemoFrom] = useState<TeamKey>("tom");
  const [memoTo, setMemoTo] = useState<TeamKey>("jessa");
  const [memoGoal, setMemoGoal] = useState("");
  const [memoDue, setMemoDue] = useState("");
  const [memoBrief, setMemoBrief] = useState("");
  const [memoSending, setMemoSending] = useState(false);
  const [memoError, setMemoError] = useState<string | null>(null);
  const memoOpenBy: Record<string, string[]> = {};
  for (const m of openMemos)
    (memoOpenBy[m.prospect_id] ??= []).push(teamMember(m.to_key)?.name ?? m.to_key);

  function memoBriefFor(p: Prospect, to: TeamKey, from: TeamKey) {
    const toName = teamMember(to)?.name ?? "there";
    const fromName = teamMember(from)?.name ?? "";
    const office = p.current_employer?.trim();
    return [
      `Hi ${toName.split(" ")[0]},`,
      "",
      `Please call ${name(p)}${office ? ` at ${office}` : ""}${p.city ? ` (${p.city})` : ""}.`,
      "",
      p.phone ? `Phone: ${p.phone}` : "Phone: —",
      p.email ? `Email: ${p.email}` : "Email: —",
      "",
      "WHAT THEY WANT",
      "—",
      "",
      "BACKGROUND (pipeline notes)",
      p.notes?.trim() || "No notes yet — this is a first call.",
      "",
      'When you\'re done, record the outcome with one line (e.g., "Called — wants a proposal by Friday"). It goes straight onto the card.',
      "",
      "Thanks,",
      fromName.split(" ")[0],
    ].join("\n");
  }

  function openMemo(p: Prospect) {
    setMemoFor(p);
    setMemoGoal("");
    setMemoDue("");
    setMemoBrief(memoBriefFor(p, memoTo, memoFrom));
    setMemoError(null);
  }

  async function sendMemo() {
    if (!memoFor) return;
    if (!memoGoal.trim()) {
      setMemoError("Say what they want / the goal of the call.");
      return;
    }
    setMemoSending(true);
    setMemoError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${memoFor.id}/memo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: memoFrom, to: memoTo, goal: memoGoal, brief: memoBrief, dueOn: memoDue }),
      });
      const json = await res.json();
      if (!json.ok) {
        setMemoError(json.error ?? "Could not send the memo.");
        return;
      }
      if (!json.emailed) setError(`Memo saved, but the email did not go out${json.emailError ? `: ${json.emailError}` : ""}.`);
      setMemoFor(null);
      startTransition(() => router.refresh());
    } catch {
      setMemoError("Network error — nothing was sent.");
    } finally {
      setMemoSending(false);
    }
  }

  // Log Touch dialog
  const [touchFor, setTouchFor] = useState<Prospect | null>(null);
  const [touchKind, setTouchKind] = useState<"call" | "email" | "text" | "note">("call");
  const [touchLine, setTouchLine] = useState("");
  const [touchDay, setTouchDay] = useState("");
  const [touchSaving, setTouchSaving] = useState(false);
  const [touchError, setTouchError] = useState<string | null>(null);

  function openTouch(p: Prospect) {
    setTouchFor(p);
    setTouchKind("call");
    setTouchLine("");
    // Default the next follow-up to 3 days out (ET).
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setTouchDay(etDay(d));
    setTouchError(null);
  }

  /**
   * Stamps a touch (last_touch_at, touch_count, prospect_touches row), writes
   * the one-liner to the top of the card's notes dated today, and sets the
   * next follow-up — the Atticus "Log Touch" in one save.
   */
  async function saveTouch() {
    if (!touchFor) return;
    setTouchSaving(true);
    setTouchError(null);
    try {
      const line = touchLine.trim();
      const res = await fetch(`/api/admin/prospects/${touchFor.id}/touch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: touchKind, body: line || undefined }),
      });
      const json = await res.json();
      if (!json.ok) {
        setTouchError(json.error ?? "Could not log the touch.");
        return;
      }
      const patch: Record<string, unknown> = {
        next_followup_at: touchDay ? `${touchDay}T16:00:00.000Z` : null,
      };
      if (line) {
        const [y, m, d] = etDay(new Date()).split("-");
        const stamp = `${Number(m)}/${Number(d)}/${y.slice(2)} ${touchKind}`;
        const prev = touchFor.notes?.trim();
        patch.notes = `${stamp} — ${line}${prev ? `\n${prev}` : ""}`;
      }
      const res2 = await fetch(`/api/admin/prospects/${touchFor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json2 = await res2.json();
      if (!json2.ok) {
        setTouchError(json2.error ?? "Touch logged, but the notes/follow-up did not save.");
        return;
      }
      setTouchFor(null);
      startTransition(() => router.refresh());
    } catch {
      setTouchError("Network error — nothing was logged.");
    } finally {
      setTouchSaving(false);
    }
  }

  /** Sets (or clears, with "") the follow-up date. Stored as midday ET on that day. */
  async function setFollowup(p: Prospect, day: string) {
    setBusyId(p.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next_followup_at: day ? `${day}T16:00:00.000Z` : null }),
      });
      const json = await res.json();
      if (!json.ok) setError(json.error ?? "Could not change the follow-up date.");
      else startTransition(() => router.refresh());
    } catch {
      setError("Network error — the follow-up date did not change.");
    } finally {
      setBusyId(null);
    }
  }

  function openNotes(p: Prospect) {
    setNotesFor(p);
    setNotesText(p.notes ?? "");
    setNotesError(null);
  }

  async function saveNotes() {
    if (!notesFor) return;
    setNotesSaving(true);
    setNotesError(null);
    try {
      const res = await fetch(`/api/admin/prospects/${notesFor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText.trim() }),
      });
      const json = await res.json();
      if (!json.ok) setNotesError(json.error ?? "Could not save the notes.");
      else {
        setNotesFor(null);
        startTransition(() => router.refresh());
      }
    } catch {
      setNotesError("Network error — the notes were not saved.");
    } finally {
      setNotesSaving(false);
    }
  }

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
  /** Board columns: the funnel, then Passed (stage key "lost") at the end. */
  const COLUMNS: readonly Stage[] = [...STAGES, "lost"];
  const byStage: Record<string, Prospect[]> = {};
  for (const s of COLUMNS) byStage[s] = [];
  for (const p of prospects) {
    if (p.removed_at || trackOf(p) !== track) continue;
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
    const fu = followupDays(p);
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
        {memoOpenBy[p.id] && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {memoOpenBy[p.id].map((n) => (
              <span key={n} className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-800">
                memo open · {n}
              </span>
            ))}
          </div>
        )}
        {p.notes?.trim() && (
          <button
            type="button"
            title={expanded.has(p.id) ? "Click to collapse" : "Click to expand"}
            onClick={() =>
              setExpanded((cur) => {
                const n = new Set(cur);
                if (n.has(p.id)) n.delete(p.id);
                else n.add(p.id);
                return n;
              })
            }
            className="mt-2 block w-full text-left text-xs text-ink/80 leading-snug"
          >
            <span
              className={`whitespace-pre-line break-words ${
                expanded.has(p.id) ? "block" : "line-clamp-4"
              }`}
            >
              {p.notes.trim()}
            </span>
          </button>
        )}
        <div className="mt-2 flex items-center gap-2">
          <label
            title="Change follow-up date"
            className={`relative cursor-pointer text-[11px] font-medium px-2 py-0.5 rounded-full tabular-nums ${
              fu === null
                ? "border border-dashed border-rule text-muted hover:border-teal hover:text-teal"
                : fu < 0
                  ? "bg-red-50 text-red-700"
                  : fu === 0
                    ? "bg-amber-50 text-amber-800"
                    : "bg-emerald-50 text-emerald-800"
            }`}
            onClick={(e) => {
              const input = e.currentTarget.querySelector("input");
              try {
                input?.showPicker();
              } catch {
                input?.focus();
              }
            }}
          >
            {fu === null
              ? "Set follow-up"
              : fu < 0
                ? `Overdue ${-fu}d`
                : fu === 0
                  ? "Due today"
                  : `Due in ${fu}d`}
            <input
              type="date"
              aria-label="Follow-up date"
              disabled={busyId === p.id}
              value={p.next_followup_at ? etDay(new Date(p.next_followup_at)) : ""}
              onChange={(e) => setFollowup(p, e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
            />
          </label>
          <span
            className={`text-[11px] tabular-nums ${
              stale !== null && stale >= 7 ? "text-red-700" : "text-subtle"
            }`}
          >
            {stale === null
              ? "no touch yet"
              : stale === 0
                ? "touched today"
                : `touched ${stale}d ago`}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => openTouch(p)}
            className="text-xs font-semibold px-2.5 py-1 rounded-sm bg-ink text-paper hover:bg-navy disabled:opacity-40"
            title="Stamp a call, email or text and set the next follow-up"
          >
            Log Touch
          </button>
          <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => openVa(p)}
            className="text-xs font-semibold px-2.5 py-1 rounded-sm border border-teal text-teal hover:bg-teal hover:text-white disabled:opacity-40"
            title="Script, call, send briefing"
          >
            ☎ VA call
          </button>
          <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => openMemo(p)}
            className="text-xs font-semibold px-2.5 py-1 rounded-sm border border-rule text-ink hover:border-teal hover:text-teal disabled:opacity-40"
            title="Send a memo to the team"
          >
            Memo
          </button>
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
            <option value="lost">{stageLabel(track, "lost")}</option>
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
          {next === "registered" && track === "student" ? (
            <button
              type="button"
              disabled={busyId === p.id}
              onClick={() => promote(p.id)}
              className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-teal text-white hover:bg-teal-deep disabled:opacity-40"
              title="Marks Closed Won ($150 paid) and creates the student record"
            >
              Closed Won → Student
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
          {p.stage !== "lost" && <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => move(p.id, "lost")}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-rule text-subtle hover:border-red-300 hover:text-red-700 disabled:opacity-40"
          >
            {stageLabel(track, "lost")}
          </button>}
          <button
            type="button"
            title="Notes"
            aria-label="Notes"
            disabled={busyId === p.id}
            onClick={() => openNotes(p)}
            className="ml-auto self-center text-sm leading-none px-1 py-0.5 rounded-sm hover:bg-ink/5 disabled:opacity-40"
          >
            📝
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {memoFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Memo — ${name(memoFor)}`}
          onClick={(e) => {
            if (e.target === e.currentTarget && !memoSending) setMemoFor(null);
          }}
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl leading-snug">Memo — {name(memoFor)}</h2>
              <button type="button" onClick={() => setMemoFor(null)} aria-label="Close" className="text-muted hover:text-ink text-xl leading-none">×</button>
            </div>
            <p className="mt-3 text-sm text-muted">
              The memo is saved on this card. The recipient gets an email with a private link, answers there, and the answer lands in this card&apos;s notes.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted">From</label>
                <select
                  value={memoFrom}
                  onChange={(e) => {
                    const v = e.target.value as TeamKey;
                    setMemoFrom(v);
                    setMemoBrief(memoBriefFor(memoFor, memoTo, v));
                  }}
                  className="mt-1 w-full border border-rule rounded-md bg-paper px-2 py-2 text-sm"
                >
                  {PIPELINE_TEAM.map((m) => (
                    <option key={m.key} value={m.key}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted">To</label>
                <select
                  value={memoTo}
                  onChange={(e) => {
                    const v = e.target.value as TeamKey;
                    setMemoTo(v);
                    setMemoBrief(memoBriefFor(memoFor, v, memoFrom));
                  }}
                  className="mt-1 w-full border border-rule rounded-md bg-paper px-2 py-2 text-sm"
                >
                  {PIPELINE_TEAM.map((m) => (
                    <option key={m.key} value={m.key}>{m.name} — {m.email}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">What they want / goal of the call</label>
            <textarea
              value={memoGoal}
              onChange={(e) => setMemoGoal(e.target.value)}
              rows={2}
              autoFocus
              placeholder="e.g. Radiography for two assistants. Goal: agree on a next step."
              className="mt-1 w-full border border-rule rounded-md bg-paper p-3 text-sm"
            />

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">Due (optional — shows as overdue in Open memos after this date)</label>
            <input
              type="date"
              value={memoDue}
              onChange={(e) => setMemoDue(e.target.value)}
              className="mt-1 border border-rule rounded-md bg-paper px-3 py-2 text-sm"
            />

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">Call brief: {name(memoFor)}{memoFor.current_employer ? ` — ${memoFor.current_employer}` : ""}</label>
            <textarea
              value={memoBrief}
              onChange={(e) => setMemoBrief(e.target.value)}
              rows={12}
              className="mt-1 w-full border border-rule rounded-md bg-paper p-3 text-sm"
            />

            {memoError && <p className="mt-2 text-xs text-amber-800">{memoError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setMemoFor(null)}>Cancel</button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-40"
                disabled={memoSending}
                onClick={sendMemo}
              >
                {memoSending ? "Sending…" : "Send memo"}
              </button>
            </div>
          </div>
        </div>
      )}
      {vaFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`VA call — ${name(vaFor)}`}
          onClick={(e) => {
            if (e.target === e.currentTarget && !vaSending) setVaFor(null);
          }}
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl leading-snug">
                VA call — {name(vaFor)}
              </h2>
              <button
                type="button"
                onClick={() => setVaFor(null)}
                aria-label="Close"
                className="text-muted hover:text-ink text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              1) Get the script — built from this card&apos;s notes. 2) Call{" "}
              {name(vaFor)}
              {vaFor.phone ? ` at ${vaFor.phone}` : ""}. 3) Record what they said and
              send the briefing.
            </p>

            <div className="mt-4 border border-rule rounded-md p-3 bg-paper-subtle/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted">Call script</span>
                <button
                  type="button"
                  disabled={vaScripting}
                  onClick={getScript}
                  className="text-xs font-semibold text-teal underline disabled:opacity-40"
                >
                  {vaScripting ? "Writing…" : vaScript ? "Rewrite" : "Get script"}
                </button>
              </div>
              <textarea
                value={vaScript}
                onChange={(e) => setVaScript(e.target.value)}
                rows={8}
                placeholder="Press Get script — or type your own."
                className="mt-2 w-full border border-rule rounded-md bg-paper p-3 text-sm"
              />
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs border border-rule rounded-md px-3 py-2">
              <span className="font-semibold text-ink">Calendly</span>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="text-teal underline truncate">
                {CALENDLY_URL.replace("https://", "")}
              </a>
              <button
                type="button"
                className="ml-auto text-teal underline font-semibold"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(CALENDLY_URL);
                    setVaCopied(true);
                  } catch {
                    setVaError("Could not copy — select the link and copy it by hand.");
                  }
                }}
              >
                {vaCopied ? "Copied" : "Copy link"}
              </button>
            </div>

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">
              What they said — answers to the questions
            </label>
            <div className="relative">
              <textarea
                value={vaSaid}
                onChange={(e) => setVaSaid(e.target.value)}
                rows={4}
                className="mt-1 w-full border border-rule rounded-md bg-paper p-3 pr-10 text-sm"
              />
              <button
                type="button"
                title={listening ? "Stop dictating" : "Dictate"}
                onClick={toggleDictation}
                className={`absolute right-2 bottom-2 text-base leading-none px-1.5 py-1 rounded-sm ${
                  listening ? "bg-red-100 animate-pulse" : "hover:bg-ink/5"
                }`}
              >
                🎤
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted">Outcome</label>
                <select
                  value={vaOutcome}
                  onChange={(e) => setVaOutcome(e.target.value)}
                  className="mt-1 w-full border border-rule rounded-md bg-paper px-2 py-2 text-sm"
                >
                  <option value="">Choose…</option>
                  {CALL_OUTCOMES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted">Callback / follow-up date</label>
                <input
                  type="date"
                  value={vaCallback}
                  onChange={(e) => setVaCallback(e.target.value)}
                  className="mt-1 w-full border border-rule rounded-md bg-paper px-2 py-2 text-sm"
                />
              </div>
            </div>

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">Email the briefing to</label>
            <div className="mt-1 space-y-1">
              {PIPELINE_TEAM.map((m) => (
                <label key={m.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={vaTo.has(m.key)}
                    onChange={(e) =>
                      setVaTo((cur) => {
                        const n = new Set(cur);
                        if (e.target.checked) n.add(m.key);
                        else n.delete(m.key);
                        return n;
                      })
                    }
                  />
                  <span className="text-ink">{m.name}</span>
                  <span className="text-xs text-muted">{m.email}</span>
                </label>
              ))}
              {vaFor.email && (
                <label className="flex items-center gap-2 text-sm pt-1">
                  <input
                    type="checkbox"
                    checked={vaFollowupContact}
                    onChange={(e) => setVaFollowupContact(e.target.checked)}
                  />
                  <span className="text-ink">Also send {name(vaFor)} a short follow-up with the Calendly link</span>
                  <span className="text-xs text-muted">{vaFor.email}</span>
                </label>
              )}
            </div>

            {vaError && <p className="mt-2 text-xs text-amber-800">{vaError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setVaFor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-40"
                disabled={vaSending}
                onClick={sendBriefing}
              >
                {vaSending ? "Sending…" : "Send briefing"}
              </button>
            </div>
          </div>
        </div>
      )}
      {touchFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Log Touch — ${name(touchFor)}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setTouchFor(null);
          }}
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl leading-snug">
                Log Touch — {name(touchFor)}
              </h2>
              <button
                type="button"
                onClick={() => setTouchFor(null)}
                aria-label="Close"
                className="text-muted hover:text-ink text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              Stamps today as the last touch, puts your one-liner at the top of
              the card&apos;s notes, and sets the next follow-up.
            </p>

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">
              What kind of touch
            </label>
            <div className="mt-1 flex gap-1.5">
              {(["call", "email", "text", "note"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTouchKind(k)}
                  className={`px-3 py-1 text-xs uppercase tracking-wider rounded-sm border ${
                    touchKind === k
                      ? "bg-teal text-white border-teal"
                      : "border-rule text-ink hover:border-teal"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">
              What happened — one line (optional)
            </label>
            <input
              type="text"
              value={touchLine}
              onChange={(e) => setTouchLine(e.target.value)}
              autoFocus
              placeholder="e.g. Left voicemail, asked for a call back Tue"
              className="mt-1 w-full border border-rule rounded-md bg-paper px-3 py-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !touchSaving) saveTouch();
              }}
            />

            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">
              Next follow-up
            </label>
            <input
              type="date"
              value={touchDay}
              onChange={(e) => setTouchDay(e.target.value)}
              className="mt-1 border border-rule rounded-md bg-paper px-3 py-2 text-sm"
            />
            <span className="ml-2 text-xs text-muted">Clear it for no follow-up.</span>

            {touchError && <p className="mt-2 text-xs text-amber-800">{touchError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setTouchFor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-40"
                disabled={touchSaving}
                onClick={saveTouch}
              >
                {touchSaving ? "Saving…" : "Log Touch"}
              </button>
            </div>
          </div>
        </div>
      )}
      {notesFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Notes — ${name(notesFor)}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setNotesFor(null);
          }}
        >
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-paper rounded-lg shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl leading-snug">
                Notes — {name(notesFor)}
              </h2>
              <button
                type="button"
                onClick={() => setNotesFor(null)}
                aria-label="Close"
                className="text-muted hover:text-ink text-xl leading-none"
              >
                ×
              </button>
            </div>
            <label className="block mt-4 text-[10px] uppercase tracking-wider text-muted">
              Notes
            </label>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={12}
              autoFocus
              placeholder="Calls, what they said, next step…"
              className="mt-1 w-full border border-rule rounded-md bg-paper p-3 text-sm"
            />
            {notesError && <p className="mt-2 text-xs text-amber-800">{notesError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setNotesFor(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-ink text-paper text-sm font-medium disabled:opacity-40"
                disabled={notesSaving}
                onClick={saveNotes}
              >
                {notesSaving ? "Saving…" : "Save notes"}
              </button>
            </div>
          </div>
        </div>
      )}
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
          {COLUMNS.map((s) => (
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
              {COLUMNS.flatMap((s) => byStage[s]).map((p) => {
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
