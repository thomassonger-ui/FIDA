import { redirect } from "next/navigation";
import { getPortalStudent } from "@/lib/portal-auth";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");

  return (
    <div className="max-w-2xl">
      <div className="eyebrow mb-3">Profile</div>
      <h1 className="text-3xl md:text-4xl mb-2">Your details</h1>
      <p className="text-muted mb-8">
        Need to change something here? Open a message and let us know.
      </p>

      <div className="card p-5 space-y-4">
        <Field label="Name" value={student.full_name ?? "—"} />
        <Field label="Email" value={student.email} />
        <Field label="Phone" value={student.phone ?? "—"} />
        <Field label="Program" value={student.program ?? "—"} />
        <Field label="Cohort" value={student.cohort_id ?? "—"} />
        <Field label="Status" value={student.status ?? "—"} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-sm text-ink">{value}</div>
    </div>
  );
}
