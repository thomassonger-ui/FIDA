"use client";

// Ask Atticus + Audit Binder for FIDA admin. Searches only FIDA's own files.
import { useEffect, useState } from "react";
import { BINDER_TABS } from "@/lib/binder-tabs";

export const QUICK_PROMPTS: { label: string; text: string; binder?: boolean }[] = [
  { label: "CIE inspection / renewal binder", text: "CIE is coming for our licensure renewal inspection. Build the full binder.", binder: true },
  { label: "Accreditation visit binder", text: "Accreditation site visit binder for our renewal.", binder: true },
  { label: "Attorney: refunds", text: "Our attorney needs our refund policy, enrollment agreement and anything on refunds or cancellations.", binder: true },
  { label: "Student file", text: "Build the complete student file for ", binder: true },
  { label: "What's missing?", text: "What's missing before our next inspection?", binder: true },
  { label: "Policies & catalog", text: "What does our refund policy say, and where are our catalog and enrollment agreement?" },
  { label: "Courses & CE", text: "Show our course outlines, program hours and CE certificate records." },
];

const btn = "inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium disabled:opacity-50";
const primary = `${btn} bg-navy text-white hover:opacity-90`;
const ghost = `${btn} border border-rule bg-paper text-ink hover:bg-paper-subtle`;
const chip = "rounded-full border border-rule bg-paper px-3 py-1 text-xs text-ink hover:bg-paper-subtle disabled:opacity-50";
const card = "mt-6 border border-rule bg-paper p-5 rounded-sm";

async function post<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}

interface Source { n: number; file_name: string; page_no: number; excerpt: string }
interface Plan { title: string; reviewer: string; scope: string; date_range: string | null; tabs: number[]; student_id?: string | null; student_name?: string | null }
interface Built { url: string | null; found: number; missing: number; gaps: { tab: number; name: string; missing: string[] }[] }

export function AskAtticus({ initialQ, initialBinder }: { initialQ?: string; initialBinder?: boolean }) {
  const [q, setQ] = useState(initialQ ?? "");
  const [busy, setBusy] = useState<null | "ask" | "plan" | "build">(null);
  const [err, setErr] = useState<string | null>(null);
  const [answer, setAnswer] = useState<{ answer: string; sources: Source[] } | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [built, setBuilt] = useState<Built | null>(null);
  const reset = () => { setErr(null); setAnswer(null); setPlan(null); setBuilt(null); };

  const ask = async (text = q) => {
    if (!text.trim()) return; reset(); setBusy("ask");
    try { setAnswer(await post("/api/admin/ask", { query: text })); } catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  };
  const planBinder = async (text = q) => {
    if (!text.trim()) return; reset(); setBusy("plan");
    try { setPlan((await post<{ plan: Plan }>("/api/admin/binder", { mode: "plan", request: text })).plan); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  };
  const build = async () => {
    if (!plan) return; setErr(null); setBusy("build");
    try { setBuilt(await post("/api/admin/binder", { mode: "build", plan })); } catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  };
  useEffect(() => {
    if (initialQ) { if (initialBinder) void planBinder(initialQ); else void ask(initialQ); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggle = (n: number) => plan && setPlan({ ...plan, tabs: plan.tabs.includes(n) ? plan.tabs.filter((x) => x !== n) : [...plan.tabs, n].sort((a, b) => a - b) });

  return (
    <div>
      <div className="border border-rule bg-paper p-5 rounded-sm">
        <textarea className="w-full min-h-[90px] rounded-sm border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-navy"
          value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. CIE is coming Tuesday — what do they need? / Attorney wants our refund policy as of March 2025 / Complete file for Maria Lopez" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={primary} onClick={() => ask()} disabled={!q.trim() || !!busy}>{busy === "ask" ? "Searching…" : "Ask"}</button>
          <button className={ghost} onClick={() => planBinder()} disabled={!q.trim() || !!busy}>{busy === "plan" ? "Planning…" : "Build a binder"}</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button key={p.label} className={chip} disabled={!!busy}
              onClick={() => { setQ(p.text); if (p.text.endsWith(" ")) return; if (p.binder) void planBinder(p.text); else void ask(p.text); }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {err ? <p className="mt-4 text-sm text-red-700">{err}</p> : null}

      {answer ? (
        <div className={card}>
          <p className="whitespace-pre-wrap text-sm text-ink">{answer.answer}</p>
          {answer.sources.length ? (
            <div className="mt-4 border-t border-rule pt-3">
              <div className="eyebrow">Sources</div>
              {answer.sources.map((s) => (
                <p key={s.n} className="mt-2 text-xs text-muted"><span className="font-semibold text-ink">[{s.n}] {s.file_name}, page {s.page_no}</span> — {s.excerpt}…</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {plan && !built ? (
        <div className={card}>
          <div className="eyebrow text-teal-deep">Here&apos;s my plan — confirm or adjust</div>
          <h3 className="mt-1 text-2xl">{plan.title}</h3>
          <p className="mt-1 text-sm text-muted">
            For <span className="text-ink">{plan.reviewer}</span> · {plan.scope}{plan.date_range ? ` · ${plan.date_range}` : ""}
            {plan.student_name ? <> · Student: <span className="text-ink">{plan.student_name}</span></> : null}
          </p>
          <div className="mt-4 grid gap-1 md:grid-cols-2">
            {BINDER_TABS.map((t) => (
              <label key={t.n} className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={plan.tabs.includes(t.n)} onChange={() => toggle(t.n)} /> Tab {t.n} · {t.name}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className={primary} onClick={build} disabled={!!busy || plan.tabs.length === 0}>{busy === "build" ? "Building your binder… about a minute" : "Build PDF binder"}</button>
            <button className={ghost} onClick={() => setPlan(null)} disabled={!!busy}>Cancel</button>
          </div>
        </div>
      ) : null}

      {built ? (
        <div className={card}>
          <h3 className="text-2xl">Your binder is ready</h3>
          <p className="mt-1 text-sm text-muted">
            {built.found} items found · <span className={built.missing ? "text-amber-700" : ""}>{built.missing} missing</span>. The gap report is on page 2.
            The download link works for one hour; a copy is kept in the document vault.
          </p>
          {built.url ? <a href={built.url} className={`${primary} mt-3`}>Download PDF binder</a> : null}
          {built.gaps.some((g) => g.missing.length) ? (
            <div className="mt-4 border-t border-rule pt-3">
              <div className="eyebrow">Still needed</div>
              {built.gaps.filter((g) => g.missing.length).map((g) => (
                <p key={g.tab} className="mt-2 text-xs text-muted"><span className="font-semibold text-ink">Tab {g.tab} · {g.name}:</span> {g.missing.join(", ")}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ---- What's New v2.0 + compact prompt for the Overview page
const WHATS_NEW = [
  ["Ask Atticus", "Type what you need — “CIE is coming Tuesday, what do they need?” — and Atticus finds it in your files."],
  ["Audit Binder", "One click builds a tabbed PDF binder with a gap report showing what's missing — for an inspection, an attorney or one student."],
  ["Scanned documents now readable", "Atticus reads scanned PDFs and photos, page by page."],
  ["Every answer cited", "Each result shows the file and page it came from."],
] as const;

export function AtticusOverviewCard() {
  const KEY = "fida-atticus-whatsnew-v2-hidden";
  const [hidden, setHidden] = useState(true);
  const [q, setQ] = useState("");
  useEffect(() => { try { setHidden(localStorage.getItem(KEY) === "1"); } catch { setHidden(false); } }, []);
  const go = (text: string, binder = false) => {
    window.location.href = `/admin/ask?q=${encodeURIComponent(text)}${binder ? "&binder=1" : ""}`;
  };
  return (
    <div className="mb-10 grid gap-4 lg:grid-cols-2">
      {!hidden ? (
        <div className="border border-rule bg-paper-subtle p-5 rounded-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow text-teal-deep">What&apos;s New · v2.0</div>
              <h3 className="mt-1 text-2xl">What&apos;s New in Atticus v2.0</h3>
            </div>
            <button className="text-xs text-subtle hover:text-ink" onClick={() => { try { localStorage.setItem(KEY, "1"); } catch {} setHidden(true); }}>Hide</button>
          </div>
          <ul className="mt-3 space-y-2">
            {WHATS_NEW.map(([t, d]) => <li key={t} className="text-sm text-muted"><span className="font-semibold text-ink">{t}</span> — {d}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="border border-rule bg-paper p-5 rounded-sm">
        <h3 className="text-2xl">Ask Atticus</h3>
        <p className="mt-1 text-xs text-muted">Inspector, attorney or consultant asking for records? Type it the way they said it.</p>
        <div className="mt-3 flex gap-2">
          <input className="w-full rounded-sm border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-navy" value={q}
            placeholder="e.g. CIE is coming Tuesday — what do they need?" onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) go(q.trim()); }} />
          <button className={primary} onClick={() => q.trim() && go(q.trim())} disabled={!q.trim()}>Ask</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.filter((p) => !p.text.endsWith(" ")).slice(0, 4).map((p) => (
            <button key={p.label} className={chip} onClick={() => go(p.text, !!p.binder)}>{p.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
