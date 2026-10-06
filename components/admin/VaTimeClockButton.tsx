"use client";

// VA Time Clock — floating button on /admin/prospects, above the VA Call Plan
// button. Opens a pop-up.
//   • The VA (signed in with her Atticus VA email): clock in / clock out for
//     FIDA. Saved on Atticus, where her pay and FIDA's monthly billing run.
//   • Everyone else (Debbie, Ashley, Tom): FIDA's VA hours — passed in as
//     children (the server-rendered VaHoursPanel). No pay amounts.

import { useCallback, useEffect, useState, type ReactNode } from "react";

interface Shift {
  id: string;
  client_key: string;
  task: string | null;
  started_at: string;
}
interface Status {
  role?: "staff";
  va_name?: string;
  shift?: Shift | null;
  tasks?: string[];
}

const field =
  "w-full rounded-sm border border-rule bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none";
const fmt = (ms: number) => {
  const m = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

export function VaTimeClockButton({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<Status | null>(null);
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");
  const [appts, setAppts] = useState("0");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/va-clock", { cache: "no-store" });
      setS(res.ok ? ((await res.json()) as Status) : { role: "staff" });
    } catch {
      setS({ role: "staff" });
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [load]);

  async function post(payload: Record<string, unknown>) {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/va-clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(out.error || "Could not save");
      setNotes("");
      setAppts("0");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  if (!s) return null;
  const staff = s.role === "staff";
  const shift = s.shift ?? null;
  const onFida = shift?.client_key === "fida";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-ink"
      >
        {shift && <span className="h-2 w-2 rounded-full bg-emerald-300" />}
        ⏱ VA Time Clock
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div
            className={`mt-10 w-full rounded-sm bg-white p-5 shadow-xl ${staff ? "max-w-5xl" : "max-w-md"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center">
              <h3 className="text-xl font-semibold text-ink">VA Time Clock</h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="ml-auto text-xl text-muted hover:text-ink">
                ×
              </button>
            </div>

            {staff ? (
              children
            ) : (
              <div className="text-sm text-ink">
                <p className="text-muted">{s.va_name} · Florida Institute of Dental Assisting</p>

                {shift && !onFida && (
                  <p className="mt-3 rounded-sm bg-amber-50 px-3 py-2 text-amber-900">
                    You&rsquo;re clocked in for another client. Clock out on tryatticus.com first.
                  </p>
                )}

                {shift && onFida && (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-sm bg-emerald-50 px-3 py-2 text-emerald-900">
                      Clocked in · {shift.task} · {fmt(now - new Date(shift.started_at).getTime())}
                    </div>
                    <textarea
                      className={`${field} min-h-[80px]`}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What did you do this shift?"
                    />
                    <label className="flex items-center gap-2 text-muted">
                      Qualified appointments
                      <input type="number" min={0} className={`${field} w-20`} value={appts} onChange={(e) => setAppts(e.target.value)} />
                    </label>
                    <button
                      disabled={busy}
                      onClick={() => post({ action: "clock_out", notes, appts })}
                      className="w-full rounded-sm bg-ink px-4 py-2 font-semibold text-white hover:bg-teal disabled:opacity-50"
                    >
                      Clock Out &amp; Send Report
                    </button>
                  </div>
                )}

                {!shift && (
                  <div className="mt-3 space-y-2">
                    <select className={field} value={task} onChange={(e) => setTask(e.target.value)}>
                      <option value="">Pick a task…</option>
                      {(s.tasks ?? []).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <button
                      disabled={busy || !task}
                      onClick={() => post({ action: "clock_in", task })}
                      className="w-full rounded-sm bg-ink px-4 py-2 font-semibold text-white hover:bg-teal disabled:opacity-50"
                    >
                      Clock In
                    </button>
                  </div>
                )}
                {err && <p className="mt-2 text-red-600">{err}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
