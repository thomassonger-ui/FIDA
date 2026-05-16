"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  ticketId: string;
  // When the ticket isn't linked to an enrolled student, supply these so the
  // form can also open the staff member's mail client to deliver the reply.
  prospectEmail?: string | null;
  prospectName?: string | null;
  subject?: string | null;
};

function buildReplyMailto(opts: {
  to: string;
  subject: string;
  prospectName: string | null;
  replyBody: string;
}): string {
  const firstName = opts.prospectName?.split(" ")[0] ?? "";
  const greeting = firstName ? `Hi ${firstName},\n\n` : "Hi,\n\n";
  const body = `${greeting}${opts.replyBody}\n\n— FIDA Support\nsuccess@fldentalassisting.com`;
  return `mailto:${encodeURIComponent(opts.to)}?subject=${encodeURIComponent(
    "Re: " + opts.subject
  )}&body=${encodeURIComponent(body)}`;
}

export function AdminReplyForm({
  ticketId,
  prospectEmail,
  prospectName,
  subject,
}: Props) {
  const router = useRouter();
  const [internal, setInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProspect = !!prospectEmail;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("internal", internal ? "1" : "0");
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
      // For prospects (unlinked tickets), also open the mail client with the
      // saved reply pre-filled. Skip when it's an internal note.
      if (isProspect && !internal && replyBody && prospectEmail && subject) {
        const href = buildReplyMailto({
          to: prospectEmail,
          subject,
          prospectName: prospectName ?? null,
          replyBody,
        });
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
          {internal
            ? "Internal note (not visible to student)"
            : isProspect
            ? "Reply to submitter"
            : "Reply to student"}
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
          internal
            ? "Add a private note for the team…"
            : isProspect
            ? "Reply — saves to the ticket thread and opens your mail client with this text pre-filled…"
            : "Reply to the student…"
        }
        className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm text-muted cursor-pointer hover:text-teal transition-colors">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-rule hover:border-teal">
            📎 Attach a file (max 10 MB)
          </span>
          <input type="file" name="attachment" className="hidden" />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : internal
            ? "Save note"
            : isProspect
            ? "Save & open email"
            : "Send reply"}
        </button>
      </div>

      <div className="text-xs text-subtle">
        {internal
          ? "Internal notes stay in the admin queue — students never see them."
          : isProspect
          ? "Prospect tickets aren't connected to a portal yet, so we'll save your reply to the thread for the record AND open your mail client to send it directly. Convert them to a student to switch to portal-only replies."
          : "Replies post into the student's portal at /portal/tickets. The student sees it next time they sign in."}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
    </form>
  );
}
