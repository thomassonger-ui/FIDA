"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import FieldInput from "@/components/sis/FieldInput";
import type { FieldDef } from "@/lib/sis";

type Values = Record<string, unknown>;

/**
 * Edit modal for the student record. Fields come from sis_field_defs,
 * already filtered to what the viewer's role may see and to the student's
 * program — so each school's configuration drives this form.
 */
export default function StudentEdit({
  studentId,
  fields,
  initial,
}: {
  studentId: string;
  fields: FieldDef[];
  initial: Values;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Values>(initial);

  const setField = (k: string, v: string | boolean) =>
    setForm((f) => {
      const next = { ...f, [k]: v };
      return next;
    });

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/record`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (fields.length === 0) return null;

  if (!open) {
    return (
      <button
        onClick={() => {
          setForm(initial);
          setOpen(true);
        }}
        className="text-xs border border-rule rounded-sm px-3 py-1.5 hover:border-teal"
      >
        Edit details
      </button>
    );
  }

  const groups = Array.from(new Set(fields.map((f) => f.section)));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 p-6">
      <div className="w-full max-w-3xl border border-rule bg-paper rounded-sm p-6 my-6">
        <div className="font-display text-lg text-ink mb-4">Edit student record</div>
        {groups.map((g) => (
          <div key={g} className="mb-5">
            <div className="text-[11px] uppercase tracking-wider text-subtle mb-2">
              {g === "custom" ? "Program fields" : g}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {fields
                .filter((f) => f.section === g)
                .map((f) => (
                  <FieldInput key={f.key} f={f} value={form[f.key]} onChange={(v) => setField(f.key, v)} />
                ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-muted mb-4">
          <span className="text-amber-700">*</span> required by your school&rsquo;s SIS settings.
          Every changed field is written to the audit trail (old value → new value).
        </p>
        {error && <div className="text-sm text-red-700 mb-3">{error}</div>}
        <div className="flex gap-3">
          <button onClick={save} disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Save changes"}
          </button>
          <button onClick={() => setOpen(false)} className="text-sm text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
