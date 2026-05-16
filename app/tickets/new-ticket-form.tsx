"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "academics", label: "Academics" },
  { value: "financial_aid", label: "Financial Aid" },
  { value: "scheduling", label: "Scheduling" },
  { value: "transcripts", label: "Transcripts" },
  { value: "tech", label: "Tech / Login" },
  { value: "other", label: "Other" },
];

const PROGRAMS = [
  { value: "radiography", label: "Radiography for Dental Personnel" },
  { value: "efda", label: "Expanded Functions Dental Auxiliary (EFDA)" },
  { value: "foundation", label: "Dental Assisting Foundation" },
  { value: "professional_development", label: "Professional Development course" },
  { value: "", label: "Not sure / not enrolled yet" },
];

export function NewTicketForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/tickets", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not submit. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card p-6 border-teal/40 bg-teal/5">
        <div className="eyebrow mb-2">Ticket received</div>
        <h3 className="font-display text-xl text-navy mb-2">
          Thanks &mdash; we&rsquo;ve got it.
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          A FIDA staff member will follow up by email within one business day.
          Keep an eye on your inbox.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name" htmlFor="student_name">
          <input
            id="student_name"
            name="student_name"
            type="text"
            autoComplete="name"
            className={INPUT_CLASSES}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={INPUT_CLASSES}
            placeholder="jane@example.com"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Program" htmlFor="program">
          <select id="program" name="program" className={INPUT_CLASSES} defaultValue="">
            {PROGRAMS.map((p) => (
              <option key={p.label} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" htmlFor="category" required>
          <select id="category" name="category" required className={INPUT_CLASSES} defaultValue="">
            <option value="" disabled>
              Choose one&hellip;
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Subject" htmlFor="subject" required>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          className={INPUT_CLASSES}
          placeholder="Short summary of your question"
        />
      </Field>

      <Field label="Message" htmlFor="body" required>
        <textarea
          id="body"
          name="body"
          required
          maxLength={8000}
          rows={6}
          className={`${INPUT_CLASSES} resize-y`}
          placeholder="Walk us through what's going on. The more detail, the better."
        />
      </Field>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? "Submitting…" : "Submit ticket"}
        </button>
        <span className="text-xs text-subtle">
          We&rsquo;ll follow up by email within one business day.
        </span>
      </div>
    </form>
  );
}

const INPUT_CLASSES =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label}
        {required && <span className="text-teal ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
