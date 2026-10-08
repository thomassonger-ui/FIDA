import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalStudent } from "@/lib/portal-auth";
import { fieldsForStudent, labelFor, loadFieldDefs, valueOf } from "@/lib/sis";
import { photoUrl } from "@/lib/sis-photo";
import MyInfo from "@/components/portal/MyInfo";
import PhotoUpload from "@/components/sis/PhotoUpload";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");
  const s = student as unknown as Record<string, unknown>;
  const [defs, photo] = await Promise.all([loadFieldDefs(), photoUrl(s.photo_ref)]);
  const rows = fieldsForStudent(defs, student.program).map((f) => {
    const value = valueOf(s, f);
    return { f, value: value ?? null, display: labelFor(f, value) };
  });

  return (
    <div className="max-w-3xl">
      <div className="eyebrow mb-3">Profile</div>
      <h1 className="text-3xl md:text-4xl mb-2">My info</h1>
      <p className="text-muted mb-8">
        Keep your contact details current. Need to change your legal name, date of birth or program?{" "}
        <Link href="/portal/tickets/new" className="text-teal underline underline-offset-2">Open a message</Link> and the registrar will update it.
      </p>

      <div className="card p-5">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0 w-[112px]">
            <div className="w-[112px] h-[140px] rounded-sm border border-rule bg-paper-subtle overflow-hidden flex items-center justify-center text-[11px] text-subtle text-center">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="w-full h-full object-cover" />
              ) : (
                "No photo yet"
              )}
            </div>
            {!photo && defs.length > 0 && <div className="mt-1"><PhotoUpload endpoint="/api/portal/photo" label="Add my photo" /></div>}
            <Link href="/portal/id-card" className="block mt-3 text-xs text-teal hover:underline">My ID card &rarr;</Link>
          </div>
          <div className="flex-1 min-w-0">
            {rows.length > 0 ? (
              <MyInfo rows={rows} />
            ) : (
              <dl className="space-y-3 text-sm">
                {[["Name", student.full_name], ["Email", student.email], ["Phone", student.phone], ["Program", student.program], ["Cohort", student.cohort_id], ["Status", student.status]].map(([l, v]) => (
                  <div key={l as string}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{l as string}</dt>
                    <dd className="mt-1 text-ink">{(v as string) || "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
