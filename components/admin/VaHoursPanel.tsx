// VA hours panel on /admin/prospects — the VA's time clocked to FIDA on
// Atticus (tryatticus.com), where she clocks in and tags each session with a
// client. Read-only: FIDA is billed monthly by Square invoice from Atticus.
//
// The statement token opens FIDA's VA hours on Atticus and nothing else.
// Server-side only (this is a server component) — never sent to the browser.

import { ATTICUS_FIDA_STATEMENT } from "@/lib/atticus-va";
import { VaAssignmentEditor, type VaAssignment } from "./VaAssignmentEditor";
import { VaMessages, type VaMemo, type VaQuestion } from "./VaMessages";

interface VaEntry {
  id: string;
  va_name: string | null;
  task: string | null;
  started_at: string;
  ended_at: string | null;
  hours: number | string | null;
  notes: string | null;
  billed_at: string | null;
}
interface VaStatement {
  account: { client_name: string; bill_to_name: string; bill_to_email: string };
  hourly_rate: number;
  unbilled: { entries: number; hours: number; amount: number };
  entries: VaEntry[];
  assignment?: VaAssignment | null;
  memos?: VaMemo[];
  questions?: VaQuestion[];
}

const TZ = "America/New_York";
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
const ym = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }).slice(0, 7);

async function fetchStatement(): Promise<VaStatement | null> {
  try {
    const res = await fetch(ATTICUS_FIDA_STATEMENT, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as VaStatement;
  } catch {
    return null;
  }
}

export async function VaHoursPanel() {
  const s = await fetchStatement();
  if (!s) return null;

  const done = s.entries.filter((e) => e.ended_at);
  const hrs = (e: VaEntry) => Number(e.hours || 0);
  const allHours = done.reduce((t, e) => t + hrs(e), 0);
  const thisMonth = ym(new Date());
  const monthHours = done.filter((e) => ym(new Date(e.started_at)) === thisMonth).reduce((t, e) => t + hrs(e), 0);
  const vaName = s.entries.find((e) => e.va_name)?.va_name;

  return (
    <section className="mt-8 card p-5 border-l-4 border-l-teal">
      <div className="eyebrow text-teal-deep">VA hours</div>
      <h2 className="font-display text-2xl text-ink mt-1">{vaName ?? "Virtual assistant"}</h2>
      <p className="text-xs text-muted mt-1">
        Time clocked to FIDA on Atticus · {money(s.hourly_rate)}/hr · billed monthly to {s.account.bill_to_name} (
        {s.account.bill_to_email}) by Square invoice
      </p>

      <div className="flex flex-wrap gap-10 mt-4">
        <Mini label="Unbilled hours" value={s.unbilled.hours.toFixed(2)} sub={`${s.unbilled.entries} sessions`} />
        <Mini label="Amount due" value={money(s.unbilled.amount)} sub={`at ${money(s.hourly_rate)}/hr`} />
        <Mini label="This month" value={monthHours.toFixed(2)} sub="hours" />
        <Mini label="All time" value={allHours.toFixed(2)} sub="hours" />
      </div>

      {s.assignment && <VaAssignmentEditor assignment={s.assignment} vaName={vaName ?? "the VA"} />}
      {s.memos && s.questions && (
        <VaMessages memos={s.memos} questions={s.questions} vaName={vaName ?? "the VA"} endpoint="/api/admin/va-messages" />
      )}

      <details open className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink select-none">Sessions</summary>
        <div className="mt-2 overflow-x-auto border border-rule rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle text-left text-[11px] uppercase tracking-eyebrow text-muted">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Time (ET)</th>
                <th className="px-4 py-2">Task</th>
                <th className="px-4 py-2 text-right">Hours</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="text-ink">
              {s.entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted">
                    No FIDA hours yet. Sessions show here when the VA clocks in on Atticus and picks FIDA.
                  </td>
                </tr>
              )}
              {s.entries.map((e) => (
                <tr key={e.id} className="border-t border-rule align-top">
                  <td className="px-4 py-2 whitespace-nowrap">{day(e.started_at)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-muted">
                    {time(e.started_at)}–{e.ended_at ? time(e.ended_at) : "now"}
                  </td>
                  <td className="px-4 py-2">
                    <div>{e.task || "—"}</div>
                    {e.notes && <div className="mt-0.5 text-xs text-muted line-clamp-2 max-w-2xl">{e.notes}</div>}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{e.ended_at ? hrs(e).toFixed(2) : "—"}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{e.ended_at ? money(hrs(e) * s.hourly_rate) : "—"}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {!e.ended_at ? (
                      <span className="text-teal">Clocked in</span>
                    ) : e.billed_at ? (
                      <span className="text-muted">
                        Billed {new Date(e.billed_at).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-amber-800">Unbilled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="eyebrow text-teal-deep">{label}</div>
      <div className="font-display text-3xl tabular-nums text-ink mt-1">{value}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}
