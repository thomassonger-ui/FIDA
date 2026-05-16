import Link from "next/link";
import { listStudents } from "@/lib/students-db";

export const dynamic = "force-dynamic";

function fmtDate(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
  const students = await listStudents();

  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="eyebrow mb-3">Students</div>
          <h1 className="text-3xl md:text-4xl mb-2">Enrolled students</h1>
          <p className="text-muted">
            {students.length} {students.length === 1 ? "student" : "students"}{" "}
            in the roster.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/admin/students/new" className="btn-primary whitespace-nowrap">
            + New Student
          </Link>
          <Link href="/admin/students/upload" className="btn-outline">
            Import
          </Link>
          <a href="/api/admin/students/export" className="btn-outline" download>
            Export CSV
          </a>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="border border-rule bg-paper-subtle p-10 rounded-sm text-center">
          <div className="font-display text-lg text-ink mb-1">No students yet</div>
          <p className="text-sm text-muted mb-4">
            Add a student directly or bulk-import a CSV.
          </p>
          <Link href="/admin/students/new" className="btn-primary">+ New Student</Link>
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
                <tr key={s.id} className="border-t border-rule hover:bg-paper-subtle/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/students/${s.id}`} className="text-navy hover:text-teal font-medium">
                      {s.full_name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{s.email}</td>
                  <td className="px-4 py-3 text-muted">{s.program || "—"}</td>
                  <td className="px-4 py-3 text-muted">{s.cohort_id || "—"}</td>
                  <td className="px-4 py-3 text-muted text-xs">{fmtDate(s.start_date)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status] ?? STATUS_TONE.invited}`}>
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
