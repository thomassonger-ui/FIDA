"use client";

// Assignment for the VA — what FIDA wants her to work on. Saved to Atticus,
// where it shows on her time-clock card for FIDA:
//   today's focus · task checklist (she checks items off) ·
//   weekly appointment target · weekly hour cap (weeks Mon–Sun, Eastern).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  text: string;
  done: boolean;
  done_at: string | null;
}
export interface VaAssignment {
  focus: string | null;
  tasks: Task[];
  target_appts: number | null;
  hour_cap: number | null;
  updated_at: string | null;
  week_hours: number;
  week_appts: number;
}

const field =
  "w-full rounded-sm border border-rule bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-teal";

function Bar({ title, used, goal, hours }: { title: string; used: number; goal: number; hours?: boolean }) {
  const pct = goal > 0 ? Math.min(100, (used / goal) * 100) : 0;
  const over = used >= goal;
  return (
    <div className="min-w-[200px] flex-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="eyebrow text-teal-deep">{title}</span>
        <span className="font-semibold tabular-nums text-ink">
          {hours ? used.toFixed(1) : used} of {goal}
          {hours ? " h" : ""}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-subtle">
        <div
          className={`h-full ${over ? (hours ? "bg-red-700" : "bg-teal-deep") : "bg-teal"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function VaAssignmentEditor({ assignment: a, vaName }: { assignment: VaAssignment; vaName: string }) {
  const router = useRouter();
  const first = vaName.split(" ")[0];
  const [editing, setEditing] = useState(false);
  const [focus, setFocus] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [target, setTarget] = useState("");
  const [cap, setCap] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setFocus(a.focus ?? "");
    setTasks(a.tasks);
    setTarget(a.target_appts === null ? "" : String(a.target_appts));
    setCap(a.hour_cap === null ? "" : String(a.hour_cap));
    setNewTask("");
    setErr(null);
  }, [a, editing]);

  async function save() {
    setBusy(true);
    setErr(null);
    const list = newTask.trim() ? [...tasks, { id: "", text: newTask.trim(), done: false, done_at: null }] : tasks;
    try {
      const res = await fetch("/api/admin/va-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus, tasks: list, target_appts: target, hour_cap: cap }),
      });
      const out = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(out.error || "Could not save");
      setEditing(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  const empty = !a.focus && a.tasks.length === 0 && a.target_appts === null && a.hour_cap === null;
  const open = a.tasks.filter((t) => !t.done).length;

  return (
    <div className="mt-5 rounded-sm border border-rule bg-white p-4">
      <div className="flex items-center gap-3">
        <h3 className="font-display text-xl text-ink">Assignment for {first}</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-outline ml-auto text-xs">
            {empty ? "Add assignment" : "Edit"}
          </button>
        )}
      </div>

      {!editing ? (
        <div className="mt-3 space-y-4">
          {empty && (
            <p className="text-sm text-muted">
              Tell {first} what to work on for FIDA — it shows on her time clock when she clocks in for FIDA.
            </p>
          )}
          {a.focus && (
            <div className="border-l-4 border-teal bg-paper-subtle px-3 py-2">
              <div className="eyebrow text-teal-deep">Today&rsquo;s focus</div>
              <p className="mt-0.5 whitespace-pre-line text-sm font-semibold text-ink">{a.focus}</p>
            </div>
          )}
          {a.tasks.length > 0 && (
            <div>
              <div className="eyebrow text-teal-deep">
                Tasks · {open} open · {a.tasks.length - open} done
              </div>
              <ul className="mt-1 space-y-1">
                {a.tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 text-sm">
                    <span className={t.done ? "text-teal-deep" : "text-muted"}>{t.done ? "✓" : "○"}</span>
                    <span className={t.done ? "text-muted line-through" : "text-ink"}>{t.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(a.target_appts !== null || a.hour_cap !== null) && (
            <div className="flex flex-wrap gap-6">
              {a.target_appts !== null && (
                <Bar title="Appointments this week" used={a.week_appts} goal={a.target_appts} />
              )}
              {a.hour_cap !== null && <Bar title="Hours this week" used={a.week_hours} goal={a.hour_cap} hours />}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="eyebrow text-teal-deep">Today&rsquo;s focus</span>
            <textarea
              className={`${field} mt-1 min-h-[56px]`}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. Call back the schools that asked for info this week"
            />
          </label>
          <div>
            <span className="eyebrow text-teal-deep">Tasks</span>
            <ul className="mt-1 space-y-1">
              {tasks.map((t, i) => (
                <li key={t.id || i} className="flex items-center gap-2">
                  <span className={t.done ? "text-teal-deep" : "text-muted"}>{t.done ? "✓" : "○"}</span>
                  <input
                    className={field}
                    value={t.text}
                    onChange={(e) => setTasks((x) => x.map((y, j) => (j === i ? { ...y, text: e.target.value } : y)))}
                  />
                  <button
                    onClick={() => setTasks((x) => x.filter((_, j) => j !== i))}
                    aria-label="Remove task"
                    className="text-muted hover:text-red-700"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <input
              className={`${field} mt-1`}
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTask.trim()) {
                  e.preventDefault();
                  setTasks((x) => [...x, { id: "", text: newTask.trim(), done: false, done_at: null }]);
                  setNewTask("");
                }
              }}
              placeholder="Add a task, press Enter"
            />
            {tasks.some((t) => t.done) && (
              <button
                onClick={() => setTasks((x) => x.filter((t) => !t.done))}
                className="mt-1 text-xs font-semibold text-teal-deep hover:underline"
              >
                Clear finished tasks
              </button>
            )}
          </div>
          <div className="grid max-w-md grid-cols-2 gap-3">
            <label className="block">
              <span className="eyebrow text-teal-deep">Appts / week</span>
              <input type="number" min={0} className={`${field} mt-1`} value={target} onChange={(e) => setTarget(e.target.value)} placeholder="—" />
            </label>
            <label className="block">
              <span className="eyebrow text-teal-deep">Hour cap / week</span>
              <input type="number" min={0} step={0.5} className={`${field} mt-1`} value={cap} onChange={(e) => setCap(e.target.value)} placeholder="—" />
            </label>
          </div>
          <div className="flex gap-2">
            <button disabled={busy} onClick={save} className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50">
              {busy ? "Saving…" : "Save"}
            </button>
            <button disabled={busy} onClick={() => setEditing(false)} className="btn-outline text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
      {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
      <p className="mt-3 text-[11px] text-muted">Weeks run Mon–Sun (Eastern). Saved to Atticus — shows on {first}&rsquo;s time clock for FIDA.</p>
    </div>
  );
}
