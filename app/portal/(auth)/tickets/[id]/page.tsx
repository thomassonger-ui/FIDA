import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CATEGORY_LABELS, STATUS_LABELS, getAttachmentsForMessages, getMessages,
  getTicket, normalizeEmail, signedAttachmentUrl, statusTone,
  type TicketCategory,
} from "@/lib/tickets-db";
import { getPortalStudent } from "@/lib/portal-auth";
import { PortalReplyForm } from "./reply-form";

export const dynamic = "force-dynamic";

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch { return ts; }
}

function toneClass(t: ReturnType<typeof statusTone>) {
  switch (t) {
    case "warn": return "bg-amber-50 text-amber-800 border-amber-200";
    case "open": return "bg-teal/10 text-teal-deep border-teal/30";
    case "ok": return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "muted":
    default: return "bg-paper-subtle text-muted border-rule";
  }
}

export default async function PortalTicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");

  const ticket = await getTicket(id);
  if (!ticket) return notFound();
  if (normalizeEmail(ticket.email) !== normalizeEmail(student.email)) return notFound();

  const messages = await getMessages(id);
  const attachments = await getAttachmentsForMessages(messages.map((m) => m.id));
  const attByMsg = new Map<number, typeof attachments>();
  for (const a of attachments) {
    const arr = attByMsg.get(a.message_id) ?? [];
    arr.push(a); attByMsg.set(a.message_id, arr);
  }
  const signed: Record<number, string | null> = {};
  for (const a of attachments) signed[a.id] = await signedAttachmentUrl(a.storage_path);

  const tone = toneClass(statusTone(ticket.status));
  const canReply = ticket.status !== "closed";

  return (
    <div className="max-w-4xl">
      <div className="text-xs text-subtle mb-4">
        <Link href="/portal/tickets" className="hover:text-teal">← Your messages</Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <div className="eyebrow">Message thread</div>
          <h1 className="mt-2 font-display text-3xl text-navy break-words">{ticket.subject}</h1>
          <div className="mt-2 text-xs text-subtle flex flex-wrap items-center gap-2">
            <span>{CATEGORY_LABELS[(ticket.category as TicketCategory) ?? "other"]}</span>
            <span aria-hidden="true">·</span>
            <span>Opened {fmt(ticket.created_at)}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tone}`}>
          {STATUS_LABELS[ticket.status]}
        </span>
      </div>

      <ol className="space-y-5">
        {messages.map((m) => {
          const mine = m.author_type === "student";
          return (
            <li key={m.id} className={`card p-5 ${mine ? "ml-0 mr-12 bg-white" : "ml-12 mr-0 bg-paper-subtle/60"}`}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1">
                <span className={mine ? "text-navy" : "text-teal"}>
                  {mine ? "You" : "FIDA Staff"}
                </span>
                <span className="text-subtle font-normal ml-2">{fmt(m.created_at)}</span>
              </div>
              <div className="whitespace-pre-wrap text-sm text-ink leading-relaxed">{m.body}</div>
              {(attByMsg.get(m.id) ?? []).length > 0 && (
                <ul className="mt-3 space-y-1.5 text-xs">
                  {(attByMsg.get(m.id) ?? []).map((a) => (
                    <li key={a.id}>
                      {signed[a.id] ? (
                        <a href={signed[a.id]!} target="_blank" rel="noreferrer" className="text-teal hover:underline">
                          📎 {a.filename} ({Math.round(a.size_bytes / 1024)} KB)
                        </a>
                      ) : (
                        <span className="text-subtle">📎 {a.filename}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      {canReply ? (
        <div className="mt-10">
          <div className="eyebrow mb-3">Reply</div>
          <PortalReplyForm ticketId={ticket.id} />
        </div>
      ) : (
        <div className="mt-10 card p-5 text-sm text-muted">
          This message thread is closed. <Link href="/portal/tickets/new" className="text-teal hover:underline">Start a new one</Link> if you need more help.
        </div>
      )}
    </div>
  );
}
