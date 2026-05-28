import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  getAttachmentsForMessages,
  getMessages,
  getTicket,
  signedAttachmentUrl,
  statusTone,
  type TicketCategory,
  type TicketStatus,
} from "@/lib/tickets-db";
import { getStudentByEmail } from "@/lib/students-db";
import { AdminReplyForm } from "./admin-reply-form";
import { ConvertToStudentButton } from "./convert-to-student-button";
import { StatusControls } from "./status-controls";

export const dynamic = "force-dynamic";

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

function toneClass(t: ReturnType<typeof statusTone>) {
  switch (t) {
    case "warn":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "open":
      return "bg-teal/10 text-teal-deep border-teal/30";
    case "ok":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "muted":
    default:
      return "bg-paper-subtle text-muted border-rule";
  }
}


const STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "awaiting_staff",
  "awaiting_student",
  "resolved",
  "closed",
];

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id);
  if (!ticket) return notFound();

  const student = await getStudentByEmail(ticket.email);
  const messages = await getMessages(id, { includeInternal: true });
  const attachments = await getAttachmentsForMessages(messages.map((m) => m.id));
  const attByMsg = new Map<number, typeof attachments>();
  for (const a of attachments) {
    const arr = attByMsg.get(a.message_id) ?? [];
    arr.push(a);
    attByMsg.set(a.message_id, arr);
  }
  const signed: Record<number, string | null> = {};
  for (const a of attachments) {
    signed[a.id] = await signedAttachmentUrl(a.storage_path);
  }

  const tone = toneClass(statusTone(ticket.status));

  return (
    <div>
      <div className="text-xs text-subtle mb-4">
        <Link href="/admin/tickets" className="hover:text-teal">
          ← All messages
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="eyebrow">Message thread</div>
          <h1 className="mt-1 text-2xl md:text-3xl break-words">{ticket.subject}</h1>
          <div className="mt-2 text-xs text-subtle flex flex-wrap items-center gap-2">
            <span>{ticket.student_name || "—"}</span>
            <span aria-hidden="true">·</span>
            <span>{ticket.email}</span>
            <span aria-hidden="true">·</span>
            <span>{ticket.program || "—"}</span>
            <span aria-hidden="true">·</span>
            <span>{CATEGORY_LABELS[(ticket.category as TicketCategory) ?? "other"]}</span>
            <span aria-hidden="true">·</span>
            <span>Opened {fmt(ticket.created_at)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tone}`}>
            {STATUS_LABELS[ticket.status]}
          </span>
          {!student && <ConvertToStudentButton ticketId={ticket.id} />}
          <StatusControls
            ticketId={ticket.id}
            current={ticket.status}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversation */}
        <div className="lg:col-span-2">
          <ol className="space-y-4">
            {messages.map((m) => {
              const internal = m.is_internal_note;
              const fromStudent = m.author_type === "student";
              const cls = internal
                ? "bg-amber-50 border-amber-200"
                : fromStudent
                ? "bg-paper-subtle border-rule"
                : "bg-white border-rule";
              return (
                <li key={m.id} className={`border rounded-md p-4 ${cls}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-1 flex flex-wrap items-center gap-2">
                    <span className={fromStudent ? "text-navy" : "text-teal"}>
                      {fromStudent ? (student ? "Student" : "Submitter") : internal ? "Internal note" : "FIDA Staff"}
                    </span>
                    {m.author_name && (
                      <span className="text-subtle font-normal">· {m.author_name}</span>
                    )}
                    <span className="text-subtle font-normal">· {fmt(m.created_at)}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-ink leading-relaxed">
                    {m.body}
                  </div>
                  {(attByMsg.get(m.id) ?? []).length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-xs">
                      {(attByMsg.get(m.id) ?? []).map((a) => (
                        <li key={a.id}>
                          {signed[a.id] ? (
                            <a
                              href={signed[a.id]!}
                              target="_blank"
                              rel="noreferrer"
                              className="text-teal hover:underline"
                            >
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

          <div className="mt-8">
<AdminReplyForm
              ticketId={ticket.id}
              prospectEmail={student ? null : ticket.email}
              prospectName={student ? null : ticket.student_name}
              subject={ticket.subject}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 text-sm">
          <div className="card p-4">
            <div className="eyebrow mb-2">Status</div>
            <div className="text-navy font-medium">{STATUS_LABELS[ticket.status]}</div>
            <div className="text-xs text-subtle mt-1">
              Updated {fmt(ticket.updated_at)}
            </div>
          </div>
          <div className="card p-4">
            <div className="eyebrow mb-2">{student ? "Student" : "Submitter"}</div>
            <div className="text-navy">{student?.full_name || ticket.student_name || "—"}</div>
            <div className="text-xs text-muted break-all">{ticket.email}</div>
            {student ? (
              <Link
                href={`/admin/students/${student.id}`}
                className="mt-2 inline-block text-xs font-semibold text-teal hover:text-teal-deep"
              >
                View student profile →
              </Link>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                Not enrolled
              </div>
            )}
          </div>
          <div className="card p-4">
            <div className="eyebrow mb-2">Program</div>
            <div className="text-navy">{ticket.program || "—"}</div>
          </div>
          <div className="card p-4">
            <div className="eyebrow mb-2">Category</div>
            <div className="text-navy">
              {CATEGORY_LABELS[(ticket.category as TicketCategory) ?? "other"]}
            </div>
          </div>
          <div className="card p-4">
            <div className="eyebrow mb-2">Last reply</div>
            <div className="text-navy text-sm">{fmt(ticket.last_reply_at)}</div>
            <div className="text-xs text-subtle">by {ticket.last_reply_by}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
