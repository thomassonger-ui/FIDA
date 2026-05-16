"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  ticketId: string;
  studentEmail: string;
  studentName: string | null;
  subject: string;
};

/**
 * Build a mailto: URL pre-populated with the staff member's reply text.
 * Body: greeting + the reply they just typed + signature.
 */
function buildReplyMailto(opts: {
  to: string;
  subject: string;
  studentName: string | null;
  replyBody: string;
}): string {
  const firstName = opts.studentName?.split(" ")[0] ?? "";
  const greeting = firstName ? `Hi ${firstName},\n\n` : "Hi,\n\n";
  const body = `${greeting}${opts.replyBody}\n\n— FIDA Support\nsuccess@fldentalassisting.com`;
  return `mailto:${encodeURIComponent(opts.to)}?subject=${encodeURIComponent(
    "Re: " + opts.subject
  )}&body=${encodeURIComponent(body)}`;
}

export function AdminReplyForm({
  ticketId,
  studentEmail,
  studentName,
  subject,
}: Props) {
  const router = useRouter();
  const [internal, setInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoEmail, setAutoEmail] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("internal", internal ? "1" : "0");

    // Capture the reply body now so we can use it for the mailto: after save.
    const replyBody = String(fd.get("body") ?? "").trim();

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

      // Auto-pop the email client with the saved reply unless this is an
      // internal note (which should never go to the student) or the user
      // unchecked auto-email.
      if (!internal && autoEmail && replyBody) {
        const href = buildReplyMailto({
          to: studentEmail,
          subject,
          studentName,
          replyBody,
        });
        // window.location keeps the active tab — opens the OS mail handler.
        window.location.href = href;
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
        <div className="eyebrow">
          {internal ? "Internal note (not sent to student)" : "Reply to student"}
        </div>
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
        placeholder={
          internal ? "Add a private note for the team…" : "Reply to the student…"
        }
        className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm text-muted cursor-pointer hover:text-teal transition-colors">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-rule hover:border-teal">
              📎 Attach a file (max 10 MB)
            </span>
            <input type="file" name="attachment" className="hidden" />
          </label>
          {!internal && (
            <label className="text-xs text-muted inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEmail}
                onChange={(e) => setAutoEmail(e.target.checked)}
              />
              Email student on save
            </label>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : internal
            ? "Save note"
            : autoEmail
            ? "Save & email student"
            : "Save reply"}
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
