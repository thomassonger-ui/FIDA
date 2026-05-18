import Link from "next/link";
import { getDemoCohorts, getOverviewKpis } from "@/lib/demo-cohorts";
import { demoStudents } from "@/lib/demo-students";
import { getServerClient } from "@/lib/supabase";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  statusTone,
  type Ticket,
  type TicketCategory,
} from "@/lib/tickets-db";

export const dynamic = "force-dynamic";

function Kpi({
  value,
  label,
  tone,
  sub,
}: {
  value: string | number;
  label: string;
  tone?: "default" | "warn" | "risk";
  sub?: string;
}) {
  const color =
    tone === "risk"
      ? "text-red-700"
      : tone === "warn"
      ? "text-amber-700"
      : "text-ink";
  return (
    <div className="border border-rule bg-paper p-5 rounded-sm">
      <div className={`font-display text-3xl ${color}`}>{value}</div>
      <div className="eyebrow mt-1">{label}</div>
      {sub && <div className="text-xs text-subtle mt-1">{sub}</div>}
    </div>
  );
}

/** Ticket stats for the overview KPI tile + recent-activity card. */
async function getTicketStats(): Promise<{
  open: number;
  awaitingStaff: number;
  resolvedLast7d: number;
  recent: Ticket[];
}> {
  const empty = { open: 0, awaitingStaff: 0, resolvedLast7d: 0, recent: [] };
  try {
    const supabase = getServerClient();

    const [openRes, awaitRes, resolvedRes, recentRes] = await Promise.all([
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "awaiting_staff", "awaiting_student"]),
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "awaiting_staff"]),
      supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("status", "resolved")
        .gte(
          "resolved_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
      supabase
        .from("tickets")
        .select("*")
        .order("last_reply_at", { ascending: false })
        .limit(5),
    ]);

    return {
      open: openRes.count ?? 0,
      awaitingStaff: awaitRes.count ?? 0,
      resolvedLast7d: resolvedRes.count ?? 0,
      recent: (recentRes.data ?? []) as Ticket[],
    };
  } catch {
    return empty;
  }
}

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

function statusToneClass(t: ReturnType<typeof statusTone>) {
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

export default async function AdminOverviewPage() {
  const [kpis, cohorts, ticketStats] = await Promise.all([
    getOverviewKpis(),
    getDemoCohorts(),
    getTicketStats(),
  ]);

  // Pull the top at-risk students across every cohort for the watchlist.
  // demoStudents is now async (live Moodle), so we Promise.all in parallel.
  type WatchRow = {
    courseId: number;
    cohortName: string;
    name: string;
    email: string;
    attendance: number;
    grade: number;
  };
  const watchlist: WatchRow[] = [];
  const studentsPerCohort = await Promise.all(
    cohorts.map((c) => demoStudents(c.courseId))
  );
  for (let i = 0; i < cohorts.length; i++) {
    const c = cohorts[i];
    const students = studentsPerCohort[i];
    for (const s of students) {
      if (s.riskTier === "risk") {
        watchlist.push({
          courseId: c.courseId,
          cohortName: c.shortname || c.fullname,
          name: s.fullname,
          email: s.email,
          attendance: s.attendancePct,
          grade: s.gradePct,
        });
      }
    }
  }
  watchlist.sort((a, b) => a.attendance - b.attendance);

  return (
    <div>
      <div className="eyebrow mb-3">Overview</div>
      <h1 className="text-3xl md:text-4xl mb-2">Operations dashboard</h1>
      <p className="text-muted max-w-prose mb-10">
        Live view of Florida Institute of Dental Assisting &mdash; enrollment,
        attendance, grades, and compliance rolled up across every active
        cohort.
      </p>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi
          value={kpis.studentsEnrolled}
          label="Students enrolled"
          sub={
            kpis.activeCohorts > 0
              ? `across ${kpis.activeCohorts} cohort${
                  kpis.activeCohorts === 1 ? "" : "s"
                }`
              : undefined
          }
        />
        <Kpi value={kpis.activeCohorts} label="Active cohorts" />
        <Kpi
          value={kpis.placement90Day !== null ? `${kpis.placement90Day}%` : "—"}
          label="Placement (90-day)"
          sub="of recent grads"
        />
        <Kpi
          value={kpis.complianceFlags}
          label="Compliance flags"
          tone={kpis.complianceFlags > 0 ? "warn" : "default"}
          sub="expiring certs + at-risk"
        />
      </div>

      {/* Secondary KPIs (now 4-col with Tickets) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Kpi
          value={
            kpis.avgAttendance !== null
              ? `${Math.round(kpis.avgAttendance)}%`
              : "—"
          }
          label="Avg attendance"
        />
        <Kpi
          value={
            kpis.avgGrade !== null ? `${Math.round(kpis.avgGrade)}%` : "—"
          }
          label="Avg grade"
        />
        <Kpi
          value={kpis.atRiskCount}
          label="Students at risk"
          tone={kpis.atRiskCount > 0 ? "risk" : "default"}
          sub="completion <75% or grade <70%"
        />
        <Link
          href="/admin/tickets"
          className="border border-rule bg-paper p-5 rounded-sm transition-colors hover:border-teal hover:bg-teal/5 group"
        >
          <div
            className={`font-display text-3xl ${
              ticketStats.awaitingStaff > 0 ? "text-amber-700" : "text-ink"
            }`}
          >
            {ticketStats.open}
          </div>
          <div className="eyebrow mt-1 group-hover:text-teal-deep transition-colors">
            Open tickets
          </div>
          <div className="text-xs text-subtle mt-1">
            {ticketStats.awaitingStaff > 0
              ? `${ticketStats.awaitingStaff} awaiting staff`
              : ticketStats.open === 0
              ? "inbox zero"
              : "all caught up"}
          </div>
        </Link>
      </div>

      {/* Tickets activity card */}
      {(ticketStats.recent.length > 0 || ticketStats.resolvedLast7d > 0) && (
        <section className="card bg-white p-6 mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <div>
              <div className="eyebrow mb-1">Recent tickets</div>
              <div className="text-xs text-subtle">
                Latest 5 by activity &middot; {ticketStats.resolvedLast7d} resolved in last 7 days
              </div>
            </div>
            <Link
              href="/admin/tickets"
              className="text-xs font-semibold text-teal hover:text-teal-deep"
            >
              View queue →
            </Link>
          </div>
          {ticketStats.recent.length === 0 ? (
            <div className="text-sm text-muted py-4">
              No tickets yet. When students submit on{" "}
              <Link href="/tickets" className="text-teal hover:underline">
                /tickets
              </Link>
              , they&rsquo;ll show up here.
            </div>
          ) : (
            <div className="overflow-x-auto border border-rule rounded-sm">
              <table className="w-full text-sm">
                <thead className="bg-paper-subtle">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                      Subject
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                      Student
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                      Category
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                      Status
                    </th>
                    <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                      Last reply
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ticketStats.recent.map((t) => (
                    <tr key={t.id} className="border-t border-rule">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/tickets/${t.id}`}
                          className="text-navy hover:text-teal font-medium"
                        >
                          {t.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <div>{t.student_name || "—"}</div>
                        <div className="text-xs text-subtle">{t.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {CATEGORY_LABELS[(t.category as TicketCategory) ?? "other"]}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${statusToneClass(
                            statusTone(t.status)
                          )}`}
                        >
                          {STATUS_LABELS[t.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {fmt(t.last_reply_at)}
                        <div className="text-subtle">by {t.last_reply_by}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Cohort breakdown */}
      {cohorts.length > 0 && (
        <section className="card bg-white p-6 mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">Active cohorts</div>
              <div className="text-xs text-subtle">
                {cohorts.length} cohort{cohorts.length === 1 ? "" : "s"} currently in session
              </div>
            </div>
          </div>
          <div className="overflow-x-auto border border-rule rounded-sm">
            <table className="w-full text-sm">
              <thead className="bg-paper-subtle">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Cohort
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Started
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Students
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Avg grade
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    At risk
                  </th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c) => (
                  <tr key={c.id} className="border-t border-rule">
                    <td className="px-4 py-3">
                      <div className="text-ink font-medium">
                        {c.shortname || c.fullname}
                      </div>
                      {c.shortname && (
                        <div className="text-xs text-subtle">{c.fullname}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(c.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-ink">{c.studentCount}</td>
                    <td className="px-4 py-3 text-ink">
                      {Math.round(c.avgAttendance)}%
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {Math.round(c.avgGrade)}%
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        c.atRiskCount > 0 ? "text-red-700" : "text-muted"
                      }`}
                    >
                      {c.atRiskCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* At-risk watchlist */}
      {watchlist.length > 0 && (
        <section className="card bg-white p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">At-risk watchlist</div>
              <div className="text-xs text-subtle">
                Students flagged for intervention this week
              </div>
            </div>
          </div>
          <div className="overflow-x-auto border border-rule rounded-sm">
            <table className="w-full text-sm">
              <thead className="bg-paper-subtle">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Student
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Cohort
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Grade
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-xs uppercase tracking-wider text-muted">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((w) => (
                  <tr
                    key={`${w.courseId}-${w.email}`}
                    className="border-t border-rule"
                  >
                    <td className="px-4 py-3 text-ink">{w.name}</td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {w.cohortName}
                    </td>
                    <td className="px-4 py-3 text-red-700">{w.attendance}%</td>
                    <td className="px-4 py-3 text-red-700">{w.grade}%</td>
                    <td className="px-4 py-3 text-muted">{w.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {cohorts.length === 0 && (
        <div className="border border-rule bg-paper-subtle p-10 rounded-sm text-center">
          <div className="font-display text-lg text-ink mb-2">
            No cohorts yet
          </div>
          <p className="text-sm text-muted max-w-md mx-auto">
            Track a Moodle course on the{" "}
            <a
              href="/admin/moodle"
              className="underline underline-offset-2 hover:text-ink"
            >
              Moodle page
            </a>{" "}
            and it&rsquo;ll show up here as a cohort with a full roster, grades,
            attendance, and compliance flags.
          </p>
        </div>
      )}
    </div>
  );
}
