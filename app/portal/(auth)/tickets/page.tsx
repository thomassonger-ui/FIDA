import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase";
import { getPortalStudent } from "@/lib/portal-auth";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  statusTone,
  type Ticket,
  type TicketCategory,
} from "@/lib/tickets-db";

export const dynamic = "force-dynamic";

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
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

async function ticketsForEmail(email: string): Promise<Ticket[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("tickets").select("*")
      .ilike("email", email)
      .order("last_reply_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as Ticket[];
  } catch { return []; }
}

export default async function PortalTicketsList() {
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");
  const tickets = await ticketsForEmail(student.email);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <div>
          <div className="eyebrow mb-3">Message Center</div>
          <h1 className="text-3xl md:text-4xl">Your messages</h1>
        </div>
        <Link href="/portal/tickets/new" className="btn-primary">+ New message</Link>
      </div>
      <p className="text-muted max-w-prose mb-8">
        Conversations with FIDA staff — academics, financial aid, scheduling, tech.
        All replies stay inside the portal for compliance.
      </p>

      {tickets.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="font-display text-2xl text-navy mb-2">No messages yet</div>
          <p className="text-muted text-sm mb-6">
            When you start a conversation, it&rsquo;ll show up here.
          </p>
          <Link href="/portal/tickets/new" className="btn-primary">Start your first message</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => {
            const tone = toneClass(statusTone(t.status));
            return (
              <li key={t.id}>
                <Link href={`/portal/tickets/${t.id}`} className="card card-hover block p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-display text-lg text-navy truncate">{t.subject}</div>
                      <div className="mt-1 text-xs text-subtle flex flex-wrap items-center gap-2">
                        <span>{CATEGORY_LABELS[(t.category as TicketCategory) ?? "other"]}</span>
                        <span aria-hidden="true">·</span>
                        <span>Updated {fmt(t.last_reply_at)}</span>
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
    </div>
  );
}
