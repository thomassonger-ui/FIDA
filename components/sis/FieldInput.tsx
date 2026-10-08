"use client";

import type { FieldDef } from "@/lib/sis";

const INPUT =
  "w-full border border-rule bg-paper-subtle px-3 py-2 rounded-sm text-sm text-ink focus:outline-none focus:border-teal";

/** One configured field as a form control. */
export default function FieldInput({
  f,
  value,
  onChange,
}: {
  f: Pick<FieldDef, "key" | "label" | "field_type" | "options" | "required">;
  value: unknown;
  onChange: (v: string | boolean) => void;
}) {
  if (f.field_type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-ink pt-6">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="accent-teal" />
        {f.label}
        {f.required && <span className="text-amber-700">*</span>}
      </label>
    );
  }
  return (
    <label className="block text-sm">
      <span className="eyebrow block mb-1">
        {f.label}
        {f.required && <span className="text-amber-700"> *</span>}
      </span>
      {f.field_type === "select" ? (
        <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} className={INPUT}>
          <option value="">—</option>
          {(f.options ?? []).map((o) => (
            <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
          ))}
        </select>
      ) : (
        <input
          type={f.field_type === "phone" ? "tel" : f.field_type === "email" ? "email" : f.field_type}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      )}
    </label>
  );
}
