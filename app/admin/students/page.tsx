import Link from "next/link";
import { listStudents } from "@/lib/students-db";
import { syncMoodleStudents } from "@/lib/students-sync";

export const dynamic = "force-dynamic";

function fmtDate(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

const STATUS_TONE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  invited: "bg-amber-50 text-amber-800 border-amber-200",
  paused: "bg-paper-subtle text-muted border-rule",
  graduated: "bg-teal/10 text-teal-deep border-teal/30",
  withdrawn: "bg-paper-subtle text-subtle border-rule",
};

export default async function StudentsPage() {
  // Pull live from Moodle first — anyone on the attendance roll appears
  // here as Active within seconds. See lib/students-sync.ts.
  const sync = await syncMoodleStudents();
  const students = await listStudents();

  const activeCount = students.filter((s) => s.status === "active").length;
  const withdrawnCount = students.filter((s) => s.status === "withdrawn")
    .length;

  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="eyebrow mb-3">Students</div>
          <h1 className="text-3xl md:text-4xl mb-2">Enrolled students</h1>
          <p className="text-muted">
            {students.length}{" "}
            {students.length === 1 ? "student" : "students"} in the roster ·{" "}
            <span className="text-emerald-800">{activeCount} active</span>
            {withdrawnCount > 0 ? (
              <>
                {" "}
                · <span className="text-subtle">{withdrawnCount} withdrawn</span>
              </>
            ) : null}
            {sync.errors.length === 0 ? (
              <> · synced from Moodle just now</>
            ) : (
              <>
                {" "}
                ·{" "}
                <span className="text-amber-800">
                  sync had {sync.errors.length} warning
                  {sync.errors.length === 1 ? "" : "s"}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/admin/students/new"
            className="btn-primary whitespace-nowrap"
          >
            + New Student
          </Link>
          <Link href="/admin/students/upload" className="btn-outline">
            Import
          </Link>
          <a
            href="/api/admin/students/export"
            className="btn-outline"
            download
          >
            Export CSV
          </a>
        </div>
      </div>

      {/* HOW THIS WORKS — written for Debbie & Ashley, especially when two
          cohorts (e.g. EFDA-S26 + RDP-CE-S26) are running side by side.
          Paired with the training-video card on the right at lg+ widths;
          stacks below the panel on smaller screens. */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start mb-8">
      <details
        className="border border-rule bg-paper-subtle rounded-sm"
        open
      >
        <summary className="cursor-pointer px-5 py-3 font-semibold text-ink select-none">
          How this list works
        </summary>
        <div className="px-5 pb-5 pt-1 text-sm text-muted space-y-3">
          <p>
            <strong className="text-ink">Moodle is the source of truth.</strong>{" "}
            Every time this page loads, the list is rebuilt from your Moodle
            attendance roll. Anyone enrolled in a tracked Moodle course shows
            up here as{" "}
            <span className="font-semibold text-emerald-800">Active</span>{" "}
            within seconds. You don&rsquo;t need to add them by hand.
          </p>
          <p>
            <strong className="text-ink">
              Two cohorts at the same time?
            </strong>{" "}
            No confusion. When EFDA and RDP-CE (or any two cohorts) are running
            together, each student&rsquo;s row shows their cohort in the{" "}
            <em>Cohort</em> column. A student enrolled in <em>both</em>{" "}
            cohorts appears once, with both shown — e.g.{" "}
            <code className="text-xs bg-paper px-1.5 py-0.5 rounded border border-rule">
              EFDA-S26, RDP-CE-S26
            </code>
            . One row per student. No duplicates.
          </p>
          <p>
            <strong className="text-ink">
              Withdrawn = unenrolled in Moodle.
            </strong>{" "}
            If a student is removed from every tracked Moodle course, their
            row stays here but the status flips to{" "}
            <span className="font-semibold">Withdrawn</span>. Their uploaded
            documents, invites, and ticket history are all preserved.
          </p>
          <p>
            <strong className="text-ink">
              Manual students still work.
            </strong>{" "}
            Use <em>+ New Student</em> to add a lead by hand before they
            enroll in Moodle. When they later show up in Moodle with the same
            email, this page automatically adopts the existing record — you
            won&rsquo;t get a duplicate.
          </p>
          <p>
            <strong className="text-ink">Need to refresh?</strong> Just reload
            the page. If you enrolled someone in Moodle a moment ago, hit
            refresh and they&rsquo;ll appear here. The{" "}
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-teal/10 text-teal-deep border-teal/30">
              Moodle
            </span>{" "}
            badge next to a name means that row is coming from the Moodle
            roster (not a manual entry).
          </p>
        </div>
      </details>

      {/* Training video — 60-second Synthesia primer on the enrollment flow.
          iframe is lazy-loaded so it doesn't slow down the initial page paint;
          YouTube scripts only load when the user scrolls the card into view. */}
      <aside className="border border-rule bg-paper rounded-sm overflow-hidden lg:sticky lg:top-6 self-start">
        <div className="aspect-video bg-black">
          <iframe
            src="https://www.youtube.com/embed/ML8m2KB9bk8?rel=0"
            title="How enrollment works at FIDA"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="px-3 py-2.5 border-t border-rule">
          <div className="text-sm font-semibold text-ink">
            How enrollment works
          </div>
          <div className="text-[11px] text-muted">
            PayPal → Moodle → Atticus · 60 sec
          </div>
        </div>
      </aside>
      </div>

      {students.length === 0 ? (
        <div className="border border-rule bg-paper-subtle p-10 rounded-sm text-center">
          <div className="font-display text-lg text-ink mb-1">
            No students yet
          </div>
          <p className="text-sm text-muted mb-4">
            Add a student directly, bulk-import a CSV, or track a Moodle
            course on the Moodle page to pull a roster in automatically.
          </p>
          <Link href="/admin/students/new" className="btn-primary">
            + New Student
          </Link>
        </div>
      ) : (
        <div className="border border-rule rounded-sm overflow-hidden bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle">
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Program</th>
                <th className="px-4 py-3 font-semibold">Cohort</th>
                <th className="px-4 py-3 font-semibold">Start</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-rule hover:bg-paper-subtle/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/students/${s.id}`}
                      className="text-navy hover:text-teal font-medium"
                    >
                      {s.full_name || "—"}
                    </Link>
                    {s.source === "moodle" ? (
                      <span
                        className="ml-2 inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-teal/10 text-teal-deep border-teal/30"
                        title="Synced from Moodle"
                      >
                        Moodle
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted">{s.email}</td>
                  <td className="px-4 py-3 text-muted">{s.program || "—"}</td>
                  <td className="px-4 py-3 text-muted">{s.cohort_id || "—"}</td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {fmtDate(s.start_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        STATUS_TONE[s.status] ?? STATUS_TONE.invited
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
