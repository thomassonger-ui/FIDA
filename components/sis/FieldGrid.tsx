import { labelFor, valueOf, isBlank, type FieldDef } from "@/lib/sis";

/** Read-only grid of configured fields for one section. */
export default function FieldGrid({
  fields,
  student,
  empty = "No fields configured for this section.",
}: {
  fields: FieldDef[];
  student: Record<string, unknown>;
  empty?: string;
}) {
  if (fields.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 border border-rule bg-paper p-5 rounded-sm">
      {fields.map((f) => {
        const v = valueOf(student, f);
        const missing = f.required && isBlank(v);
        return (
          <div key={f.key} className="flex justify-between gap-4 text-sm border-b border-rule/50 last:border-0 py-1.5">
            <dt className="text-muted">
              {f.label}
              {f.required && <span className="text-amber-700"> *</span>}
            </dt>
            <dd className={missing ? "text-amber-800 text-right" : "text-ink text-right"}>
              {missing && f.field_type !== "boolean" ? "Missing" : labelFor(f, v)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
