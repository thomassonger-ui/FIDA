"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PROGRAMS = [
  { value: "radiography", label: "Radiography for Dental Personnel" },
  { value: "efda", label: "Expanded Functions Dental Auxiliary (EFDA)" },
  { value: "foundation", label: "Dental Assisting Foundation" },
  { value: "professional_development", label: "Professional Development" },
];

const INPUT =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

export function NewStudentForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendInvite, setSendInvite] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/admin/students", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Save failed.");
        setSubmitting(false);
        return;
      }
      // Optionally fire the invite right after.
      if (sendInvite) {
        await fetch(`/api/admin/students/${json.studentId}/invite`, { method: "POST" });
      }
      router.push(`/admin/students/${json.studentId}`);
    } catch {
      setError("Network error.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field name="full_name" label="Full name" />
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Phone" type="tel" />
        <Field name="start_date" label="Start date" type="date" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Program</span>
          <select name="program" className={INPUT} defaultValue="">
            <option value="">—</option>
            {PROGRAMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        <Field name="cohort_id" label="Cohort" placeholder="e.g. RDP-JUN-2026" />
      </div>

      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Notes</span>
        <textarea name="notes" rows={3} maxLength={2000} className={`${INPUT} resize-y`} placeholder="Internal notes (not visible to student)" />
      </label>

      <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer">
        <input
          type="checkbox"
          checked={sendInvite}
          onChange={(e) => setSendInvite(e.target.checked)}
        />
        Send portal invite to this email after saving
      </label>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? "Saving…" : "Save student"}
        </button>
        <Link href="/admin/students" className="btn-outline">Cancel</Link>
      </div>
    </form>
  );
}

function Field({
  name, label, type = "text", required, placeholder,
}: {
  name: string; label: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label}{required && <span className="text-teal ml-1">*</span>}
      </span>
      <input type={type} name={name} required={required} placeholder={placeholder} className={INPUT} />
    </label>
  );
}
