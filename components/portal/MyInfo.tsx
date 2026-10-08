"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FieldInput from "@/components/sis/FieldInput";
import type { FieldDef } from "@/lib/sis";

type Row = { f: FieldDef; value: unknown; display: string };

/** Portal "My info": read-only fields plus the ones the school lets students update. */
export default function MyInfo({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const editable = rows.filter((r) => r.f.student_editable);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>(
    Object.fromEntries(editable.map((r) => [r.f.key, r.value ?? null]))
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Save failed");
      setEditing(false);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {editable.map((r) => (
            <FieldInput key={r.f.key} f={r.f} value={form[r.f.key]} onChange={(v) => setForm({ ...form, [r.f.key]: v })} />
          ))}
        </div>
        {error && <div className="text-sm text-red-700 mb-2">{error}</div>}
        <div className="flex gap-3">
          <button onClick={save} disabled={busy} className="btn-primary text-sm">{busy ? "Saving…" : "Save"}</button>
          <button onClick={() => setEditing(false)} className="text-sm text-muted hover:text-ink">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 mb-3">
        {rows.map((r) => (
          <div key={r.f.key} className="flex justify-between gap-3 text-sm border-b border-rule/50 py-1">
            <dt className="text-muted">{r.f.label}</dt>
            <dd className="text-ink text-right">{r.display}</dd>
          </div>
        ))}
      </dl>
      {editable.length > 0 && (
        <button onClick={() => { setSaved(false); setEditing(true); }} className="text-xs border border-rule rounded-sm px-3 py-1.5 hover:border-teal">
          Update my info
        </button>
      )}
      {saved && <span className="text-xs text-emerald-700 ml-3">Saved — your school has the update.</span>}
    </div>
  );
}
