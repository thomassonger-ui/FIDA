import Link from "next/link";
import { getDemoStudents } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const { data, error } = await getDemoStudents(200);

  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <div className="eyebrow mb-3">Students</div>
          <h1 className="text-3xl md:text-4xl mb-2">Enrolled students</h1>
          <p className="text-muted">
            {data.length} {data.length === 1 ? "student" : "students"} from{" "}
            <code className="text-xs bg-paper-subtle px-1">demo_students</code>.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href="/admin/students/new" className="btn-primary whitespace-nowrap">
            + New Student
          </Link>
          <Link href="/admin/students/upload" className="btn-secondary">
            Import
          </Link>
          <a
            href="/api/admin/students/export"
            className="btn-secondary"
            download
          >
            Export CSV
          </a>
        </div>
      </div>

      {error ? (
        <div className="border border-rule bg-paper-subtle p-5 rounded-sm text-sm text-muted">
          Unable to load students: {error}
        </div>
      ) : data.length === 0 ? (
        <div className="border border-rule bg-paper-subtle p-10 rounded-sm text-center">
          <div className="font-display text-lg text-ink mb-1">
            No students yet
          </div>
          <p className="text-sm text-muted mb-4">
            Import a CSV, Excel file, or Google Sheet to populate this table.
          </p>
          <Link href="/admin/students/upload" className="btn-primary">
            Import students
          </Link>
        </div>
      ) : (
        <div className="border border-rule bg-paper rounded-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-subtle border-b border-rule">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Program</th>
                <th className="text-left px-4 py-3 font-medium">Cohort</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 100).map((s, i) => {
                const row = s as Record<string, unknown>;
                return (
                  <tr
                    key={(row.id as string) ?? i}
                    className="border-b border-rule last:border-0"
                  >
                    <td className="px-4 py-3">
                      {(row.first_name as string) ?? ""}{" "}
                      {(row.last_name as string) ?? ""}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {(row.email as string) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {(row.program as string) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {(row.cohort_id as string) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {(row.status as string) ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mt-8">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Student records are created through three paths: (1)&nbsp;
          <strong>Atticus handoff</strong> &mdash; when a lead completes
          intake, their name, email, and program interest automatically seed
          an applicant record; (2)&nbsp;
          <strong>Admissions staff form</strong> &mdash; after the enrollment
          agreement is signed, staff enters legal name, DOB, CIP&nbsp;code,
          start date, and enrollment status via a validated form; (3)&nbsp;
          <strong>Bulk CSV/XLSX import</strong> &mdash; for migrating an
          existing cohort, gated to owner role.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          Every write &mdash; creation, edit, status change &mdash; logs to an
          append-only{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">
            audit_events
          </code>{" "}
          table (old value, new value, user, timestamp, reason). Records live
          in a Postgres{" "}
          <code className="font-mono text-xs bg-amber-100 px-1">students</code>{" "}
          table with row-level security scoped by staff role.
        </p>
      </div>
    </div>
  );
}
