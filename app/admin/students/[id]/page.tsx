import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase";
import {
  getStudentById, listStudentDocuments, signedDocumentUrl,
} from "@/lib/students-db";
import {
  CATEGORY_LABELS, STATUS_LABELS, statusTone,
  type Ticket, type TicketCategory,
} from "@/lib/tickets-db";
import { SendInviteButton } from "./send-invite-button";
import { AdminUploadDocForm } from "./upload-form";

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

async function ticketsForStudent(studentId: string, email: string): Promise<Ticket[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .or(`student_id.eq.${studentId},email.ilike.${email}`)
      .order("last_reply_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Ticket[];
  } catch { return []; }
}

export default async function AdminStudentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) return notFound();

  const tickets = await ticketsForStudent(student.id, student.email);
  const docs = await listStudentDocuments(student.id);
  const signed: Record<number, string | null> = {};
  for (const d of docs) signed[d.id] = await signedDocumentUrl(d.storage_path);

  return (
    <div>
      <div className="text-xs text-subtle mb-4">
        <Link href="/admin/students" className="hover:text-teal">← Students</Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="eyebrow">Student</div>
          <h1 className="text-3xl md:text-4xl mt-1">{student.full_name || student.email}</h1>
          <div className="mt-2 text-xs text-subtle flex flex-wrap items-center gap-2">
            <span>{student.email}</span>
            <span aria-hidden="true">·</span>
            <span>{student.program || "no program"}</span>
            <span aria-hidden="true">·</span>
            <span>{student.cohort_id || "no cohort"}</span>
            <span aria-hidden="true">·</span>
            <span>Status: {student.status}</span>
          </div>
        </div>
        <SendInviteButton studentId={student.id} status={student.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Tickets */}
          <section className="card bg-white p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="eyebrow mb-1">Tickets</div>
                <div className="text-xs text-subtle">{tickets.length} total</div>
              </div>
              <Link href="/admin/tickets" className="text-xs font-semibold text-teal hover:text-teal-deep">All tickets →</Link>
            </div>
            {tickets.length === 0 ? (
              <div className="text-sm text-muted py-4">No tickets yet.</div>
            ) : (
              <ul className="space-y-2">
                {tickets.map((t) => {
                  const tone = toneClass(statusTone(t.status));
                  return (
                    <li key={t.id}>
                      <Link href={`/admin/tickets/${t.id}`} className="card card-hover block p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-navy truncate">{t.subject}</div>
                            <div className="text-xs text-subtle mt-1">
                              {CATEGORY_LABELS[(t.category as TicketCategory) ?? "other"]} · Last update {fmt(t.last_reply_at)} by {t.last_reply_by}
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tone}`}>
                            {STATUS_LABELS[t.status]}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Documents */}
          <section className="card bg-white p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="eyebrow mb-1">Documents</div>
                <div className="text-xs text-subtle">{docs.length} in vault</div>
              </div>
            </div>
            <AdminUploadDocForm studentId={student.id} />
            <div className="mt-4">
              {docs.length === 0 ? (
                <div className="text-sm text-muted">No documents yet.</div>
              ) : (
                <ul className="space-y-2">
                  {docs.map((d) => (
                    <li key={d.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-navy truncate">
                          {d.label ? `${d.label}: ${d.filename}` : d.filename}
                          {d.is_required && (
                            <span className="ml-2 inline-block text-[10px] font-semibold tracking-wider uppercase text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-subtle mt-1">
                          Uploaded {fmt(d.created_at)} by {d.uploaded_by} · {Math.round(d.size_bytes / 1024)} KB
                        </div>
                      </div>
                      {signed[d.id] && (
                        <a href={signed[d.id]!} target="_blank" rel="noreferrer" className="btn-outline text-sm py-1.5 px-3">
                          Download
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 text-sm">
          <div className="card p-4">
            <div className="eyebrow mb-2">Portal status</div>
            <div className="text-navy">{student.status}</div>
            {student.user_id && (
              <div className="text-xs text-subtle mt-1">Linked to portal account</div>
            )}
          </div>
          <div className="card p-4">
            <div className="eyebrow mb-2">Program</div>
            <div className="text-navy">{student.program || "—"}</div>
          </div>
          <div className="card p-4">
            <div className="eyebrow mb-2">Phone</div>
            <div className="text-navy">{student.phone || "—"}</div>
          </div>
          <div className="card p-4">
            <div className="eyebrow mb-2">Start date</div>
            <div className="text-navy">{student.start_date || "—"}</div>
          </div>
          {student.notes && (
            <div className="card p-4">
              <div className="eyebrow mb-2">Notes</div>
              <div className="text-navy whitespace-pre-wrap text-xs">{student.notes}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
