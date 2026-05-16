import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getServerClient } from "@/lib/supabase";
import { resolvePortalStudent, listStudentDocuments } from "@/lib/students-db";
import { STATUS_LABELS, statusTone, type Ticket } from "@/lib/tickets-db";

export const dynamic = "force-dynamic";

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
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

async function recentTicketsForEmail(email: string): Promise<Ticket[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .ilike("email", email)
      .order("last_reply_at", { ascending: false })
      .limit(5);
    if (error) return [];
    return (data ?? []) as Ticket[];
  } catch {
    return [];
  }
}

export default async function PortalOverview() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return null;
  }
  const student = await resolvePortalStudent({ userId: user.id, email: user.email });
  const tickets = await recentTicketsForEmail(user.email);
  const documents = student ? await listStudentDocuments(student.id) : [];

  const openCount = tickets.filter((t) =>
    ["open", "awaiting_staff", "awaiting_student"].includes(t.status)
  ).length;
  const requiredOutstanding = documents.filter((d) => d.is_required).length;
  const firstName = (student?.full_name ?? user.user_metadata?.full_name ?? user.email)
    ?.split(" ")[0];

  return (
    <div>
      <div className="eyebrow mb-3">Welcome</div>
      <h1 className="text-3xl md:text-4xl mb-2">Hi, {firstName}.</h1>
      <p className="text-muted max-w-prose mb-10">
        Your one-stop view of tickets, messages, and documents shared between
        you and the FIDA team.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link
          href="/portal/tickets"
          className="border border-rule bg-paper p-5 rounded-sm transition-colors hover:border-teal hover:bg-teal/5"
        >
          <div className="font-display text-3xl text-ink">{openCount}</div>
          <div className="eyebrow mt-1">Open tickets</div>
          <div className="text-xs text-subtle mt-1">
            {openCount === 0 ? "All caught up" : "Tap to view"}
          </div>
        </Link>
        <Link
          href="/portal/documents"
          className="border border-rule bg-paper p-5 rounded-sm transition-colors hover:border-teal hover:bg-teal/5"
        >
          <div className="font-display text-3xl text-ink">{documents.length}</div>
          <div className="eyebrow mt-1">Documents</div>
          <div className="text-xs text-subtle mt-1">
            {requiredOutstanding > 0
              ? `${requiredOutstanding} required`
              : "View your vault"}
          </div>
        </Link>
        <Link
          href="/portal/tickets/new"
          className="border border-rule bg-paper p-5 rounded-sm transition-colors hover:border-teal hover:bg-teal/5"
        >
          <div className="font-display text-3xl text-teal">+</div>
          <div className="eyebrow mt-1">Open a ticket</div>
          <div className="text-xs text-subtle mt-1">
            Ask FIDA staff a question
          </div>
        </Link>
      </div>

      {tickets.length > 0 && (
        <section className="card bg-white p-6 mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <div>
              <div className="eyebrow mb-1">Recent tickets</div>
              <div className="text-xs text-subtle">
                Latest 5 by activity
              </div>
            </div>
            <Link href="/portal/tickets" className="text-xs font-semibold text-teal hover:text-teal-deep">
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {tickets.map((t) => {
              const tone = toneClass(statusTone(t.status));
              return (
                <li key={t.id}>
                  <Link
                    href={`/portal/tickets/${t.id}`}
                    className="card card-hover block p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-navy truncate">{t.subject}</div>
                        <div className="text-xs text-subtle mt-1">
                          Updated {fmt(t.last_reply_at)} · by {t.last_reply_by}
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
        </section>
      )}

      {!student && (
        <div className="border border-amber-200 bg-amber-50 p-5 rounded-sm">
          <div className="font-semibold text-amber-900 mb-1">
            Your portal account isn&rsquo;t linked to a student record yet.
          </div>
          <p className="text-sm text-amber-900/80">
            Reach out to{" "}
            <a className="underline" href="mailto:success@fldentalassisting.com">
              success@fldentalassisting.com
            </a>{" "}
            to complete your enrollment. You can still open tickets and view
            replies from this account.
          </p>
        </div>
      )}
    </div>
  );
}
