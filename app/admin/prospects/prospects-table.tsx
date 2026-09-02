"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  STAGES,
  STAGE_LABELS,
  SKIP_TRACE_COST_PER_HIT,
  type Limits,
  type Prospect,
} from "@/lib/prospects-shared";

const COUNTIES = ["Duval", "Clay", "St. Johns", "Nassau", "Baker", "Putnam"];

const SEGMENTS: { value: string; label: string }[] = [
  { value: "career_changer", label: "Career changer" },
  { value: "working_assistant", label: "Working dental assistant" },
  { value: "new_grad", label: "Recent high-school grad" },
  { value: "returning", label: "Returning to the field" },
  { value: "dentist_employer", label: "Dentist / employer" },
];

const PROGRAMS: { value: string; label: string }[] = [
  { value: "entry_level", label: "Entry Level Diploma" },
  { value: "efda", label: "EFDA (CE)" },
  { value: "radiography", label: "Radiography (CE)" },
  { value: "staff_training", label: "Staff training (Rad + EFDA)" },
];

const STAGE_TONE: Record<string, string> = {
  identified: "bg-paper-subtle text-muted border-rule",
  nurture: "bg-amber-50 text-amber-800 border-amber-200",
  applied: "bg-teal/10 text-teal-deep border-teal/30",
  registered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  enrolled: "bg-emerald-50 text-emerald-800 border-emerald-200",
  graduated: "bg-navy/10 text-navy border-navy/20",
  lost: "bg-paper-subtle text-subtle border-rule",
};

const DRIP_STEPS = 3;

const DRIP_LABELS: Record<string, string> = {
  not_started: "Off",
  active: "On",
  paused: "Paused",
  finished: "Done",
};

const DRIP_TONE: Record<string, string> = {
  not_started: "bg-paper-subtle text-subtle border-rule",
  active: "bg-teal/10 text-teal-deep border-teal/30",
  paused: "bg-amber-50 text-amber-800 border-amber-200",
  finished: "bg-navy/10 text-navy border-navy/20",
};

function name(p: Prospect) {
  if (p.full_name?.trim()) return p.full_name.trim();
  const j = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return j || p.email || "—";
}

export function ProspectsTable({
  initial,
  skipTracedToday,
  sentToday,
  limits,
}: {
  initial: Prospect[];
  skipTracedToday: number;
  sentToday: number;
  limits: Limits;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("");
  const [zip, setZip] = useState("");
  const [segment, setSegment] = useState("");
  const [program, setProgram] = useState("");
  const [stage, setStage] = useState("");
  const [hasPhone, setHasPhone] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [showRemoved, setShowRemoved] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initial.filter((p) => {
      if (!showRemoved && p.removed_at) return false;
      if (showRemoved && !p.removed_at) return false;
      if (county && (p.county ?? "") !== county) return false;
      if (zip && (p.zip ?? "") !== zip.trim()) return false;
      if (segment && (p.segment ?? "") !== segment) return false;
      if (program && (p.program_interest ?? "") !== program) return false;
      if (stage && p.stage !== stage) return false;
      if (hasPhone && !p.phone) return false;
      if (hasEmail && !p.email) return false;
      if (q) {
        const hay = [
          name(p),
          p.email,
          p.phone,
          p.city,
          p.zip,
          p.current_employer,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    initial,
    search,
    county,
    zip,
    segment,
    program,
    stage,
    hasPhone,
    hasEmail,
    showRemoved,
  ]);

  const allShown = rows.length > 0 && rows.every((r) => selected.has(r.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allShown ? new Set() : new Set(rows.map((r) => r.id)));
  }

  async function bulk(action: string, extra: Record<string, unknown> = {}) {
    if (selected.size === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], action, ...extra }),
      });
      const json = await res.json();
      if (!json.ok) setMessage(json.error ?? "That didn't work.");
      else {
        setSelected(new Set());
        startTransition(() => router.refresh());
      }
    } catch {
      setMessage("Network error — nothing was changed.");
    } finally {
      setBusy(false);
    }
  }

  const skipTraceRemaining = Math.max(0, limits.skipTrace - skipTracedToday);
  const emailRemaining = Math.max(0, limits.email - sentToday);

  async function drip(body: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prospects/drip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) {
        setMessage(json.error ?? "That didn't work.");
        return;
      }
      if (body.action === "start" || body.action === "pause") {
        setMessage(
          `${body.action === "start" ? "Drip on" : "Drip paused"} for ${json.changed}.` +
            (json.blocked ? ` ${json.blocked} skipped — no usable email.` : "")
        );
        setSelected(new Set());
      } else if (body.action === "send_now") {
        setMessage(
          `Sent ${json.sent}, failed ${json.failed}, ${json.skipped} waiting for tomorrow's cap ` +
            `(${json.due} were due; ${json.alreadySentToday + json.sent} of ${json.limit} used today).`
        );
      } else if (body.action === "test") {
        setMessage(`Test email sent to ${body.to}.`);
      }
      startTransition(() => router.refresh());
    } catch {
      setMessage("Network error — nothing was changed.");
    } finally {
      setBusy(false);
    }
  }

  function sendTest() {
    const to = window.prompt("Send a sample of email #1 to which address?");
    if (!to) return;
    const employer = window.confirm(
      "OK = dentist/employer version. Cancel = student version."
    );
    drip({ action: "test", to, step: 0, track: employer ? "employer" : "student" });
  }

  return (
    <>
      {/* FILTERS */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, office, city or zip"
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper w-64"
        />
        <select
          value={county}
          onChange={(e) => setCounty(e.target.value)}
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
        >
          <option value="">All counties</option>
          {COUNTIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Zip"
          inputMode="numeric"
          maxLength={5}
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper w-24"
        />
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
        >
          <option value="">All segments</option>
          {SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
        >
          <option value="">All programs</option>
          {PROGRAMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
        >
          <option value="">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
          <option value="lost">Lost</option>
        </select>
        <label className="text-sm text-muted flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasPhone}
            onChange={(e) => setHasPhone(e.target.checked)}
          />
          has phone
        </label>
        <label className="text-sm text-muted flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasEmail}
            onChange={(e) => setHasEmail(e.target.checked)}
          />
          has an email
        </label>
        <label className="text-sm text-amber-800 flex items-center gap-2">
          <input
            type="checkbox"
            checked={showRemoved}
            onChange={(e) => setShowRemoved(e.target.checked)}
          />
          show removed
        </label>
        <div className="text-sm text-muted ml-auto tabular-nums">
          {rows.length} {rows.length === 1 ? "prospect" : "prospects"}
        </div>
      </div>

      {/* BULK ACTIONS */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled
          title="Connect the skip-trace account first — see the setup note below."
          className="bg-ink text-paper text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm disabled:opacity-40"
        >
          Skip trace selected ({selected.size})
        </button>
        <span className="text-xs text-muted">
          Up to {limits.skipTrace} a day · $
          {SKIP_TRACE_COST_PER_HIT.toFixed(2)} per hit, misses free ·{" "}
          <span className="tabular-nums">{skipTraceRemaining}</span> left today
        </span>

        <span className="h-5 w-px bg-rule" aria-hidden />

        <select
          disabled={selected.size === 0 || busy}
          onChange={(e) => {
            const v = e.target.value;
            e.target.value = "";
            if (v) bulk("stage", { stage: v });
          }}
          defaultValue=""
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper disabled:opacity-40"
        >
          <option value="">Move {selected.size || ""} to stage…</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
          <option value="lost">Lost</option>
        </select>

        <button
          type="button"
          disabled={selected.size === 0 || busy}
          onClick={() => drip({ action: "start", ids: [...selected] })}
          className="btn-outline text-xs disabled:opacity-40"
        >
          Start drip ({selected.size})
        </button>
        <button
          type="button"
          disabled={selected.size === 0 || busy}
          onClick={() => drip({ action: "pause", ids: [...selected] })}
          className="btn-outline text-xs disabled:opacity-40"
        >
          Pause drip ({selected.size})
        </button>

        <span className="h-5 w-px bg-rule" aria-hidden />

        <button
          type="button"
          disabled={busy || emailRemaining === 0}
          onClick={() => drip({ action: "send_now" })}
          title="Sends whatever is due right now, up to today's cap. The cron does this every weekday morning anyway."
          className="btn-outline text-xs disabled:opacity-40"
        >
          Send today&rsquo;s batch
        </button>
        <span className="text-xs text-muted">
          <span className="tabular-nums">{emailRemaining}</span> of {limits.email} emails left today
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={sendTest}
          className="text-xs text-teal underline"
        >
          Send me a test
        </button>

        <span className="h-5 w-px bg-rule" aria-hidden />

        <button
          type="button"
          disabled={selected.size === 0 || busy}
          onClick={() => bulk(showRemoved ? "restore" : "remove")}
          className="btn-outline text-xs disabled:opacity-40"
        >
          {showRemoved ? "Restore" : "Remove"} ({selected.size})
        </button>

        {(busy || pending) && (
          <span className="text-xs text-muted">Saving…</span>
        )}
        {message && <span className="text-xs text-amber-800">{message}</span>}
      </div>

      {/* TABLE */}
      <div className="mt-4 border border-rule rounded-sm bg-paper overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-subtle">
            <tr className="border-b border-rule text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allShown}
                  onChange={toggleAll}
                  aria-label="Select all shown"
                />
              </th>
              <th className="px-3 py-3 font-semibold">Name</th>
              <th className="px-3 py-3 font-semibold">Office / employer</th>
              <th className="px-3 py-3 font-semibold">City</th>
              <th className="px-3 py-3 font-semibold">Program</th>
              <th className="px-3 py-3 font-semibold">Score&nbsp;↓</th>
              <th className="px-3 py-3 font-semibold">Phone</th>
              <th className="px-3 py-3 font-semibold">Email</th>
              <th className="px-3 py-3 font-semibold">Stage</th>
              <th className="px-3 py-3 font-semibold">Drip</th>
              <th className="px-3 py-3 font-semibold">Consent</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-muted">
                  No prospects match. Import a CSV or add one by hand to get
                  started.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-rule hover:bg-paper-subtle/40"
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      aria-label={`Select ${name(p)}`}
                    />
                  </td>
                  <td className="px-3 py-3 font-medium text-navy">{name(p)}</td>
                  <td className="px-3 py-3 text-muted">
                    {p.current_employer || "—"}
                  </td>
                  <td className="px-3 py-3 text-muted">{p.city || "—"}</td>
                  <td className="px-3 py-3 text-muted">
                    {PROGRAMS.find((x) => x.value === p.program_interest)
                      ?.label ??
                      p.program_interest ??
                      "—"}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{p.score}</td>
                  <td className="px-3 py-3 text-muted">
                    {p.phone ? (
                      <span className={p.dnc ? "line-through" : ""}>
                        {p.phone}
                      </span>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted">
                    {p.email ? (
                      <span
                        className={p.unsubscribed_at ? "line-through" : ""}
                      >
                        {p.email}
                      </span>
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        STAGE_TONE[p.stage] ?? STAGE_TONE.identified
                      }`}
                    >
                      {STAGE_LABELS[p.stage] ?? p.stage}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        DRIP_TONE[p.drip_status] ?? DRIP_TONE.not_started
                      }`}
                      title={
                        p.drip_last_sent_at
                          ? `Last sent ${new Date(p.drip_last_sent_at).toLocaleDateString()}`
                          : "Nothing sent yet"
                      }
                    >
                      {DRIP_LABELS[p.drip_status] ?? p.drip_status}
                      {p.drip_step > 0 ? ` · ${p.drip_step}/${DRIP_STEPS}` : ""}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.consent_source ? (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border bg-paper-subtle text-muted border-rule">
                          {p.consent_source.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200">
                          no source
                        </span>
                      )}
                      {p.unsubscribed_at && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border bg-red-50 text-red-800 border-red-200">
                          unsub
                        </span>
                      )}
                      {p.dnc && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border bg-red-50 text-red-800 border-red-200">
                          DNC
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
