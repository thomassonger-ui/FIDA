"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { ticketForm as f } from "@/lib/i18n/pages";


export function NewTicketForm() {
  const { t } = useLang();
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
        setError(json.error || t(f.errGeneric));
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError(t(f.errNetwork));
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card p-6 border-teal/40 bg-teal/5">
        <div className="eyebrow mb-2">{t(f.receivedEyebrow)}</div>
        <h3 className="font-display text-xl text-navy mb-2">
          {t(f.receivedTitle)}
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          {t(f.receivedBody)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t(f.fullName)} htmlFor="student_name">
          <input
            id="student_name"
            name="student_name"
            type="text"
            autoComplete="name"
            className={INPUT_CLASSES}
            placeholder={t(f.phName)}
          />
        </Field>
        <Field label={t(f.email)} htmlFor="email" required>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={INPUT_CLASSES}
            placeholder={t(f.phEmail)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t(f.program)} htmlFor="program">
          <select id="program" name="program" className={INPUT_CLASSES} defaultValue="">
            {f.programs.map((p) => (
              <option key={p.value} value={p.value}>
                {t(p.label)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t(f.category)} htmlFor="category" required>
          <select id="category" name="category" required className={INPUT_CLASSES} defaultValue="">
            <option value="" disabled>
              {t(f.chooseOne)}
            </option>
            {f.categories.map((c) => (
              <option key={c.value} value={c.value}>
                {t(c.label)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t(f.subject)} htmlFor="subject" required>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          className={INPUT_CLASSES}
          placeholder={t(f.phSubject)}
        />
      </Field>

      <Field label={t(f.message)} htmlFor="body" required>
        <textarea
          id="body"
          name="body"
          required
          maxLength={8000}
          rows={6}
          className={`${INPUT_CLASSES} resize-y`}
          placeholder={t(f.phMessage)}
        />
      </Field>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? t(f.submitting) : t(f.submit)}
        </button>
        <span className="text-xs text-subtle">
          {t(f.followUp)}
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
