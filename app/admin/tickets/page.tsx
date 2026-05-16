import Link from "next/link";
import {
  listAllTickets,
  CATEGORY_LABELS,
  STATUS_LABELS,
  statusTone,
  type TicketCategory,
  type TicketStatus,
} from "@/lib/tickets-db";

export const dynamic = "force-dynamic";

const STATUS_FILTERS: { key: string; label: string; values: TicketStatus[] }[] = [
  { key: "open", label: "Open", values: ["open", "awaiting_staff", "awaiting_student"] },
  { key: "awaiting_staff", label: "Awaiting staff", values: ["awaiting_staff", "open"] },
  { key: "resolved", label: "Resolved", values: ["resolved"] },
  { key: "all", label: "All", values: [] },
];

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

function ageHours(ts: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(ts).getTime()) / 3_600_000));
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

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; program?: string }>;
}) {
  const sp = await searchParams;
  const filterKey = sp.status || "open";
  const filter = STATUS_FILTERS.find((f) => f.key === filterKey) ?? STATUS_FILTERS[0];

  const tickets = await listAllTickets({
    status: filter.values.length ? filter.values : undefined,
    category: (sp.category as TicketCategory) || undefined,
    program: sp.program || undefined,
  });

  // Open count for header
  const allOpen = await listAllTickets({
    status: ["open", "awaiting_staff", "awaiting_student"],
  });

  return (
    <div>
      <div className="eyebrow mb-3">Support</div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
        <h1 className="text-3xl md:text-4xl">Tickets</h1>
        <div className="text-sm text-muted">
          {allOpen.length} open across all states
        </div>
      </div>
      <p className="text-muted max-w-prose mb-8">
        Student-submitted inquiries. Reply directly to keep the conversation in
        one place; the student gets a magic link by email when they need to come
        back.
      </p>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const active = f.key === filter.key;
          return (
            <Link
              key={f.key}
              href={`/admin/tickets?status=${f.key}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                active
                  ? "bg-navy text-white border-navy"
                  : "bg-white text-muted border-rule hover:border-navy hover:text-navy"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {tickets.length === 0 ? (
        <div className="border border-rule bg-paper-subtle rounded-sm p-10 text-center">
          <div className="font-display text-2xl text-navy mb-1">Inbox zero</div>
          <p className="text-sm text-muted">
            No tickets match this filter. Nice work.
          </p>
        </div>
      ) : (
        <div className="border border-rule rounded-sm overflow-hidden bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle">
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Program</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last reply</th>
                <th className="px-4 py-3 font-semibold">Age</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const tone = toneClass(statusTone(t.status));
                const age = ageHours(t.created_at);
                const ageLabel = age < 24 ? `${age}h` : `${Math.round(age / 24)}d`;
                return (
                  <tr key={t.id} className="border-t border-rule hover:bg-paper-subtle/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/tickets/${t.id}`} className="text-navy hover:text-teal font-medium">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      <div>{t.student_name || "—"}</div>
                      <div className="text-xs text-subtle">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{t.program || "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {CATEGORY_LABELS[(t.category as TicketCategory) ?? "other"]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${tone}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {fmt(t.last_reply_at)}
                      <div className="text-subtle">by {t.last_reply_by}</div>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{ageLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
