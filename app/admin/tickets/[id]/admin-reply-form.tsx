"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [internal, setInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("internal", internal ? "1" : "0");

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not send. Please try again.");
        setSubmitting(false);
        return;
      }
      form.reset();
      setInternal(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="eyebrow">{internal ? "Internal note (not sent to student)" : "Reply to student"}</div>
        <label className="text-xs text-muted inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
          />
          Internal note
        </label>
      </div>

      <textarea
        name="body"
        rows={6}
        maxLength={8000}
        placeholder={internal ? "Add a private note for the team…" : "Reply to the student…"}
        className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm text-muted cursor-pointer hover:text-teal transition-colors">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-rule hover:border-teal">
            📎 Attach a file (max 10 MB)
          </span>
          <input type="file" name="attachment" className="hidden" />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? "Sending…" : internal ? "Save note" : "Send reply"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
    </form>
  );
}
