"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FieldDef } from "@/lib/sis";

const ROLES = ["registrar", "admissions", "instructor", "read_only"];
const ROLE_SHORT: Record<string, string> = { registrar: "Reg", admissions: "Adm", instructor: "Inst", read_only: "RO" };
const SECTION_LABEL: Record<string, string> = {
  profile: "Profile",
  admissions: "Admissions",
  ferpa: "FERPA",
  custom: "Program fields",
};
const LOCKED = new Set(["student_number", "first_name", "last_name", "program"]);

export default function SisFieldManager({
  defs,
  programs,
  canEdit,
}: {
  defs: FieldDef[];
  programs: string[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    label: "",
    field_type: "text",
    options: "",
    programs: [] as string[],
    required: false,
    student_visible: false,
    student_editable: false,
  });

  async function patch(key: string, changes: Record<string, unknown>) {
    setBusy(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/sis-fields", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, ...changes }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Save failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(null);
    }
  }

  async function add() {
    setBusy("new");
    setError(null);
    try {
      const res = await fetch("/api/admin/sis-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          section: "custom",
          options: draft.options.split(",").map((s) => s.trim()).filter(Boolean),
          programs: draft.programs.length ? draft.programs : null,
          visible_roles: ["owner", "registrar", "admissions", "instructor", "read_only"],
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Could not add field");
      setAdding(false);
      setDraft({ label: "", field_type: "text", options: "", programs: [], required: false, student_visible: false, student_editable: false });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add field");
    } finally {
      setBusy(null);
    }
  }

  const sections = Array.from(new Set(defs.map((d) => d.section)));
  const box = (on: boolean, onClick: () => void, disabled = false, title?: string) => (
    <input
      type="checkbox"
      checked={on}
      disabled={!canEdit || disabled}
      onChange={onClick}
      title={title}
      className="accent-teal"
    />
  );

  return (
    <div>
      {!canEdit && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 mb-4 max-w-xl">
          View only — the school owner manages SIS fields.
        </div>
      )}
      {error && <div className="text-sm text-red-700 mb-3">{error}</div>}

      {sections.map((sec) => (
        <div key={sec} className="mb-8">
          <div className="eyebrow mb-2">{SECTION_LABEL[sec] ?? sec}</div>
          <div className="border border-rule bg-paper rounded-sm overflow-x-auto">
            <table className="w-full text-sm table-fixed min-w-[980px]">
              <colgroup>
                <col className="w-[240px]" />
                {Array.from({ length: 8 }).map((_, i) => <col key={i} className="w-[64px]" />)}
                <col />
              </colgroup>
              <thead className="bg-paper-subtle border-b border-rule text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Field</th>
                  <th className="px-2 py-2 font-medium">On</th>
                  <th className="px-2 py-2 font-medium">Required</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-2 py-2 font-medium" title={r}>{ROLE_SHORT[r]}</th>
                  ))}
                  <th className="px-2 py-2 font-medium">Stu sees</th>
                  <th className="px-2 py-2 font-medium">Stu edits</th>
                  <th className="text-left px-3 py-2 font-medium">Programs</th>
                </tr>
              </thead>
              <tbody>
                {defs
                  .filter((d) => d.section === sec)
                  .map((d) => (
                    <tr key={d.key} className={`border-b border-rule last:border-0 ${d.active ? "" : "opacity-50"} ${busy === d.key ? "animate-pulse" : ""}`}>
                      <td className="px-3 py-2">
                        <div className="text-ink">{d.label}</div>
                        <div className="text-[11px] text-subtle">
                          {d.field_type}
                          {d.options ? ` · ${d.options.join(", ")}` : ""}
                          {d.is_core ? " · core" : " · custom"}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        {box(d.active, () => patch(d.key, { active: !d.active }), LOCKED.has(d.key), LOCKED.has(d.key) ? "Always on" : undefined)}
                      </td>
                      <td className="px-2 py-2 text-center">{box(d.required, () => patch(d.key, { required: !d.required }))}</td>
                      {ROLES.map((r) => (
                        <td key={r} className="px-2 py-2 text-center">
                          {box(d.visible_roles.includes(r as FieldDef["visible_roles"][number]), () =>
                            patch(d.key, {
                              visible_roles: d.visible_roles.includes(r as FieldDef["visible_roles"][number])
                                ? d.visible_roles.filter((x) => x !== r)
                                : [...d.visible_roles, r],
                            })
                          )}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center">{box(d.student_visible, () => patch(d.key, { student_visible: !d.student_visible, ...(d.student_visible ? { student_editable: false } : {}) }))}</td>
                      <td className="px-2 py-2 text-center">{box(d.student_editable, () => patch(d.key, { student_editable: !d.student_editable }))}</td>
                      <td className="px-3 py-2 text-xs text-muted">
                        {d.programs?.length ? d.programs.join(", ") : "All"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {canEdit && !adding && (
        <button onClick={() => setAdding(true)} className="btn-primary text-sm">+ Add program field</button>
      )}
      {canEdit && adding && (
        <div className="border border-rule bg-paper rounded-sm p-5 max-w-2xl">
          <div className="font-display text-lg text-ink mb-4">New program field</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="block text-sm">
              <span className="eyebrow block mb-1">Label</span>
              <input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="e.g. TB test date"
                className="w-full border border-rule bg-paper-subtle px-3 py-2 rounded-sm text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="eyebrow block mb-1">Type</span>
              <select
                value={draft.field_type}
                onChange={(e) => setDraft({ ...draft, field_type: e.target.value })}
                className="w-full border border-rule bg-paper-subtle px-3 py-2 rounded-sm text-sm"
              >
                {["text", "date", "number", "boolean", "select", "email", "phone"].map((t) => (
                  <option key={t} value={t}>{t === "boolean" ? "yes / no" : t}</option>
                ))}
              </select>
            </label>
            {draft.field_type === "select" && (
              <label className="block text-sm sm:col-span-2">
                <span className="eyebrow block mb-1">Options (comma-separated)</span>
                <input
                  value={draft.options}
                  onChange={(e) => setDraft({ ...draft, options: e.target.value })}
                  placeholder="Small, Medium, Large"
                  className="w-full border border-rule bg-paper-subtle px-3 py-2 rounded-sm text-sm"
                />
              </label>
            )}
            <div className="sm:col-span-2">
              <span className="eyebrow block mb-1">Applies to</span>
              <div className="flex flex-wrap gap-3 text-sm">
                {programs.map((p) => (
                  <label key={p} className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      className="accent-teal"
                      checked={draft.programs.includes(p)}
                      onChange={() =>
                        setDraft({
                          ...draft,
                          programs: draft.programs.includes(p) ? draft.programs.filter((x) => x !== p) : [...draft.programs, p],
                        })
                      }
                    />
                    {p}
                  </label>
                ))}
                <span className="text-xs text-subtle self-center">(none checked = all programs)</span>
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-5 text-sm">
              <label className="inline-flex items-center gap-1.5">
                <input type="checkbox" className="accent-teal" checked={draft.required} onChange={(e) => setDraft({ ...draft, required: e.target.checked })} />
                Required
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input type="checkbox" className="accent-teal" checked={draft.student_visible} onChange={(e) => setDraft({ ...draft, student_visible: e.target.checked })} />
                Student can see it
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input type="checkbox" className="accent-teal" checked={draft.student_editable} onChange={(e) => setDraft({ ...draft, student_editable: e.target.checked })} />
                Student can update it
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={add} disabled={busy === "new" || !draft.label.trim()} className="btn-primary text-sm">
              {busy === "new" ? "Adding…" : "Add field"}
            </button>
            <button onClick={() => setAdding(false)} className="text-sm text-muted hover:text-ink">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
