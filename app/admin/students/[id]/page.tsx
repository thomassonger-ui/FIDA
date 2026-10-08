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
import { AgreementCard } from "./agreement-card";
import { latestAgreementForStudent, programUsesAgreement } from "@/lib/enrollment";
import { planLabel } from "@/lib/enrollment-agreement-text";
import {
  TAB_ROLES, fieldsForRole, loadFieldDefs, missingRequired, valueOf, viewerRole,
  type FieldDef, type Role,
} from "@/lib/sis";
import { photoUrl } from "@/lib/sis-photo";
import FieldGrid from "@/components/sis/FieldGrid";
import PhotoUpload from "@/components/sis/PhotoUpload";
import StudentEdit from "@/components/sis/StudentEdit";
import StudentNotes from "@/components/sis/StudentNotes";
import FerpaReleases, { type Release } from "@/components/sis/FerpaReleases";
import RoleSwitcher from "@/components/sis/RoleSwitcher";

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

const STATUS_CHIP: Record<string, string> = {
  invited: "bg-amber-50 text-amber-800 border-amber-200",
  active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  paused: "bg-paper-subtle text-muted border-rule",
  graduated: "bg-navy/5 text-navy border-navy/20",
  withdrawn: "bg-red-50 text-red-700 border-red-200",
};
const CHIP = "inline-block border rounded-full px-3 py-1 text-[11px] uppercase tracking-wider";
const EDIT_ROLES: Role[] = ["owner", "registrar", "admissions"];

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

async function notesAndAudit(studentId: string) {
  const supabase = getServerClient();
  const [n, a] = await Promise.all([
    supabase.from("sis_student_notes").select("body, author, created_at").eq("student_id", studentId).order("created_at", { ascending: false }).limit(50),
    supabase.from("audit_events").select("action, old_value, new_value, actor, reason, created_at").eq("entity_id", studentId).order("created_at", { ascending: false }).limit(50),
  ]);
  return { notes: n.data ?? [], audit: a.data ?? [] };
}

export default async function AdminStudentDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; as?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const student = await getStudentById(id);
  if (!student) return notFound();
  const s = student as unknown as Record<string, unknown>;

  const [{ role, actual }, defs, tickets, docs, agreement, photo, { notes, audit }] = await Promise.all([
    viewerRole(sp.as),
    loadFieldDefs(),
    ticketsForStudent(student.id, student.email),
    listStudentDocuments(student.id),
    latestAgreementForStudent(student.id),
    photoUrl(s.photo_ref),
    notesAndAudit(student.id),
  ]);
  const signed: Record<number, string | null> = {};
  for (const d of docs) signed[d.id] = await signedDocumentUrl(d.storage_path);

  const sisReady = defs.length > 0;
  const program = student.program ?? null;
  const visible = fieldsForRole(defs, role, program);
  const inSection = (sec: FieldDef["section"]) => visible.filter((f) => f.section === sec);
  const canSee = (tab: keyof typeof TAB_ROLES) => TAB_ROLES[tab].includes(role);
  const canEdit = EDIT_ROLES.includes(role);
  const missing = missingRequired(defs, s).filter((f) => visible.includes(f));
  const optOut = s.ferpa_directory_optout === true;
  const releases = (s.ferpa_releases as Release[] | null) ?? [];
  const displayName =
    `${(s.first_name as string) ?? ""} ${(s.last_name as string) ?? ""}`.trim() || student.full_name || student.email;
  const preferred = (s.preferred_name as string) || null;
  const contactEmail = (s.school_email as string) || student.email;

  const tabs: Array<[string, string]> = [
    ["profile", "Profile"],
    ...(inSection("admissions").length ? [["admissions", "Admissions"] as [string, string]] : []),
    ...(canSee("documents") ? [["documents", `Documents${docs.length ? ` (${docs.length})` : ""}`] as [string, string]] : []),
    ...(canSee("messages") ? [["messages", `Messages${tickets.length ? ` (${tickets.length})` : ""}`] as [string, string]] : []),
    ...(inSection("ferpa").length || canSee("ferpa_releases") ? [["ferpa", "FERPA"] as [string, string]] : []),
    ...(inSection("custom").length ? [["custom", "Program fields"] as [string, string]] : []),
    ...(canSee("activity") ? [["activity", "Activity"] as [string, string]] : []),
  ];
  const tab = tabs.some(([k]) => k === sp.tab) ? (sp.tab as string) : "profile";
  const href = (t: string) => `?${new URLSearchParams({ ...(sp.as ? { as: sp.as } : {}), tab: t }).toString()}`;

  const editInitial: Record<string, unknown> = {};
  for (const f of visible) editInitial[f.key] = valueOf(s, f) ?? null;

  const timeline = [
    ...notes.map((n) => ({ kind: "note" as const, when: n.created_at as string, who: n.author as string, text: n.body as string })),
    ...audit.map((a) => {
      const changed = Object.keys((a.new_value as Record<string, unknown> | null) ?? {});
      const detail = changed.length ? changed.map((k) => k.replace(/^custom\./, "").replace(/_/g, " ")).join(", ") : "";
      return {
        kind: "event" as const,
        when: a.created_at as string,
        who: a.actor as string,
        text: `${String(a.action).replace(/_/g, " ")}${detail ? ` — ${detail}` : ""}${a.reason ? ` · ${a.reason}` : ""}`,
      };
    }),
  ].sort((a, b) => b.when.localeCompare(a.when));

  return (
    <div>
      <div className="text-xs text-subtle mb-4 flex items-center justify-between gap-4">
        <Link href="/admin/students" className="hover:text-teal">← Students</Link>
        {actual === "owner" && sisReady && <RoleSwitcher role={role} />}
      </div>

      {/* Header: photo + identity chips + quick actions */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="shrink-0 w-[132px]">
          <div className="w-[132px] h-[164px] rounded-sm border border-rule bg-paper-subtle overflow-hidden flex items-center justify-center">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-4xl text-navy/40">
                {displayName.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")}
              </span>
            )}
          </div>
          {sisReady && ["owner", "registrar", "admissions"].includes(role) && (
            <div className="mt-1.5"><PhotoUpload endpoint={`/api/admin/students/${id}/photo`} /></div>
          )}
          <div className="mt-3 space-y-1 text-xs">
            <a href={`mailto:${contactEmail}`} className="block text-teal hover:underline">Send email</a>
            {student.phone && <a href={`sms:${student.phone}`} className="block text-teal hover:underline">Send text</a>}
            <Link href={`/admin/students/${id}/id-card`} className="block text-teal hover:underline">Print ID card</Link>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="eyebrow">Student</div>
          <h1 className="text-3xl md:text-4xl mt-1 mb-1">{displayName}</h1>
          {preferred && <div className="text-sm text-muted mb-2">Preferred: &ldquo;{preferred}&rdquo;</div>}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`${CHIP} bg-navy/5 text-navy border-navy/20 normal-case tracking-normal`}>
              ID {(s.student_number as string) || "—"}
            </span>
            {program && <span className={`${CHIP} bg-paper-subtle text-ink border-rule normal-case tracking-normal`}>{program}</span>}
            {student.cohort_id && <span className={`${CHIP} bg-paper-subtle text-muted border-rule normal-case tracking-normal`}>{student.cohort_id}</span>}
            <span className={`${CHIP} ${STATUS_CHIP[student.status] ?? "bg-paper-subtle text-muted border-rule"}`}>{student.status}</span>
            {student.user_id && <span className={`${CHIP} bg-emerald-50 text-emerald-800 border-emerald-200`}>portal linked</span>}
            {optOut && (
              <span className={`${CHIP} bg-red-50 text-red-700 border-red-200`} title="Student opted out of directory information — do not disclose">
                &#128274; FERPA directory opt-out
              </span>
            )}
            {missing.length > 0 && (
              <span className={`${CHIP} bg-amber-50 text-amber-800 border-amber-200`} title={missing.map((f) => f.label).join(", ")}>
                {missing.length} required field{missing.length === 1 ? "" : "s"} missing
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && <SendInviteButton studentId={student.id} status={student.status} />}
            {canEdit && sisReady && <StudentEdit studentId={id} fields={visible} initial={editInitial} />}
          </div>
          <p className="text-xs text-muted mt-3">
            {student.email}
            {role !== actual && <> · <span className="text-amber-800">previewing as {role.replace("_", " ")}</span></>}
          </p>
        </div>
      </div>

      {!sisReady && (
        <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-3 py-2 mb-6 max-w-2xl text-xs text-amber-950">
          SIS fields are not set up on this database yet. Run{" "}
          <code className="font-mono">supabase/migrations/20261008_sis.sql</code> in the Supabase SQL editor to enable
          the configurable record, FERPA tab, program fields and student self-service.
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-rule mb-6">
        {tabs.map(([k, label]) => (
          <Link key={k} href={href(k)} scroll={false}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === k ? "border-teal text-ink" : "border-transparent text-muted hover:text-ink"}`}>
            {label}
          </Link>
        ))}
      </div>

      {tab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {sisReady ? (
              <FieldGrid fields={inSection("profile")} student={s} />
            ) : (
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 border border-rule bg-paper p-5 rounded-sm text-sm">
                {[["Name", student.full_name], ["Email", student.email], ["Phone", student.phone], ["Program", student.program], ["Cohort", student.cohort_id], ["Start date", student.start_date]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between gap-4 border-b border-rule/50 last:border-0 py-1.5">
                    <dt className="text-muted">{l as string}</dt><dd className="text-ink text-right">{(v as string) || "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <aside className="space-y-4 text-sm">
            <AgreementCard
              studentId={student.id}
              summary={{
                status: agreement ? (agreement.status === "signed" ? "signed" : "sent") : "none",
                sentAt: agreement?.sent_at ?? null,
                signedAt: agreement?.signed_at ?? null,
                signerName: agreement?.signer_name ?? null,
                plan: agreement?.fields?.payment_plan ? planLabel(agreement.fields.payment_plan) : null,
                depositEmailSentAt: agreement?.deposit_email_sent_at ?? null,
                depositPaidAt: agreement?.deposit_paid_at ?? null,
                countersignedAt: agreement?.countersigned_at ?? null,
                countersignerName: agreement?.countersigner_name ?? null,
                usesAgreement: programUsesAgreement(student.program),
              }}
            />
            {student.notes && (
              <div className="card p-4">
                <div className="eyebrow mb-2">Notes</div>
                <div className="text-navy whitespace-pre-wrap text-xs">{student.notes}</div>
              </div>
            )}
          </aside>
        </div>
      )}

      {tab === "admissions" && <FieldGrid fields={inSection("admissions")} student={s} />}

      {tab === "documents" && (
        <section className="card bg-white p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">Documents</div>
              <div className="text-xs text-subtle">{docs.length} in vault</div>
            </div>
          </div>
          {canEdit && <AdminUploadDocForm studentId={student.id} />}
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
      )}

      {tab === "messages" && (
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
      )}

      {tab === "ferpa" && (
        <>
          {inSection("ferpa").length > 0 && (
            <div className="mb-6">
              <FieldGrid fields={inSection("ferpa")} student={s} />
              <p className="text-[11px] text-subtle mt-2">
                When the student opts out, their name, photo, program and dates of attendance are not released as
                directory information. Change this in Edit details.
              </p>
            </div>
          )}
          {canSee("ferpa_releases") && (
            <>
              <div className="eyebrow mb-3">Release authorizations</div>
              <FerpaReleases studentId={id} releases={releases} canEdit={role === "owner" || role === "registrar"} />
            </>
          )}
        </>
      )}

      {tab === "custom" && (
        <>
          <p className="text-xs text-muted mb-3">
            Fields FIDA added for {program ?? "this program"}. Manage them in{" "}
            <Link href="/admin/settings/sis" className="underline hover:text-teal">SIS fields</Link>.
          </p>
          <FieldGrid fields={inSection("custom")} student={s} />
        </>
      )}

      {tab === "activity" && (
        <>
          {role !== "read_only" && sisReady && <StudentNotes studentId={id} />}
          <ol className="border-l border-rule ml-2 space-y-4">
            {timeline.length === 0 && <li className="pl-5 text-sm text-muted">No activity yet.</li>}
            {timeline.map((t, i) => (
              <li key={i} className="pl-5 relative">
                <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ${t.kind === "note" ? "bg-amber-400" : "bg-teal"}`} />
                <div className="text-xs text-subtle">
                  {fmt(t.when)} · {t.who} {t.kind === "note" && <span className="text-amber-800">· private note</span>}
                </div>
                <div className={`text-sm ${t.kind === "note" ? "text-ink" : "text-muted"}`}>{t.text}</div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
