"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "academics", label: "Academics" },
  { value: "financial_aid", label: "Financial Aid" },
  { value: "scheduling", label: "Scheduling" },
  { value: "transcripts", label: "Transcripts" },
  { value: "tech", label: "Tech / Login" },
  { value: "other", label: "Other" },
];

const INPUT =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

export function PortalNewTicketForm({ defaultProgram }: { defaultProgram: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/portal/tickets", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not submit. Try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/portal/tickets/${json.ticketId}`);
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="program" value={defaultProgram} />
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
          Category<span className="text-teal ml-1">*</span>
        </span>
        <select name="category" required className={INPUT} defaultValue="">
          <option value="" disabled>Choose one…</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
          Subject<span className="text-teal ml-1">*</span>
        </span>
        <input type="text" name="subject" required maxLength={200} className={INPUT} placeholder="Short summary" />
      </label>
      <label className="block">
        <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
          Message<span className="text-teal ml-1">*</span>
        </span>
        <textarea name="body" required maxLength={8000} rows={6} className={`${INPUT} resize-y`} placeholder="Walk us through what's going on."></textarea>
      </label>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}
      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
        {submitting ? "Submitting…" : "Submit ticket"}
      </button>
    </form>
  );
}
