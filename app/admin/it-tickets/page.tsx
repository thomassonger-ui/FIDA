import { getServerClient } from "@/lib/supabase";
import { ITTicketForm } from "./ticket-form";

export const dynamic = "force-dynamic";

type ITTicket = {
  id: string;
  created_at: string;
  submitted_by_email: string;
  submitted_by_name: string | null;
  subject: string;
  body: string;
  attachment_filename: string | null;
  email_sent_at: string | null;
  email_send_error: string | null;
  status: "open" | "in_progress" | "resolved" | "closed";
};

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

async function listRecent(): Promise<ITTicket[]> {
  try {
    const sb = getServerClient();
    const { data, error } = await sb
      .from("it_tickets")
      .select(
        "id, created_at, submitted_by_email, submitted_by_name, subject, body, attachment_filename, email_sent_at, email_send_error, status"
      )
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) return [];
    return (data ?? []) as ITTicket[];
  } catch {
    return [];
  }
}

export default async function ITTicketsPage() {
  const tickets = await listRecent();

  return (
    <div>
      <div className="eyebrow mb-3">Support</div>
      <h1 className="text-3xl md:text-4xl mb-2">Tickets to IT</h1>
      <p className="text-muted max-w-prose mb-10">
        Something not working? Bug, weird behavior, missing data, can&rsquo;t
        access a page? Send Tom a ticket below. He&rsquo;ll get an email
        notification and reply directly.
      </p>

      <ITTicketForm />

      {/* RECENT TICKETS */}
      <section className="mt-12">
        <div className="eyebrow mb-3">Recent tickets</div>
        {tickets.length === 0 ? (
          <div className="card bg-paper-subtle p-8 text-center text-sm text-muted">
            No IT tickets yet. Submit one above when something needs Tom&rsquo;s
            eyes.
          </div>
        ) : (
          <ul className="space-y-3">
            {tickets.map((t) => (
              <li key={t.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-navy">
                      {t.subject}
                    </div>
                    <div className="text-xs text-subtle mt-0.5">
                      {t.submitted_by_name || t.submitted_by_email} ·{" "}
                      {fmt(t.created_at)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={
                        "px-2 py-0.5 rounded-full border " +
                        (t.status === "resolved" || t.status === "closed"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : t.status === "in_progress"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-teal/10 text-teal-deep border-teal/30")
                      }
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    {t.email_sent_at ? (
                      <span className="px-2 py-0.5 rounded-full border bg-paper-subtle text-muted border-rule">
                        ✉ sent
                      </span>
                    ) : t.email_send_error ? (
                      <span
                        className="px-2 py-0.5 rounded-full border bg-rose-50 text-rose-800 border-rose-200"
                        title={t.email_send_error}
                      >
                        ⚠ email failed
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-ink whitespace-pre-wrap line-clamp-4">
                  {t.body}
                </p>
                {t.attachment_filename && (
                  <div className="mt-2 text-xs text-muted">
                    📎 {t.attachment_filename}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
