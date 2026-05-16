import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { resolvePortalStudent } from "@/lib/students-db";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const student = await resolvePortalStudent({ userId: user.id, email: user.email });

  return (
    <div className="max-w-2xl">
      <div className="eyebrow mb-3">Profile</div>
      <h1 className="text-3xl md:text-4xl mb-2">Your details</h1>
      <p className="text-muted mb-8">
        Need to change something here? Reach out to{" "}
        <a className="text-teal hover:underline" href="mailto:success@fldentalassisting.com">success@fldentalassisting.com</a>.
      </p>

      <div className="card p-5 space-y-4">
        <Field label="Name" value={student?.full_name ?? "—"} />
        <Field label="Email" value={user.email} />
        <Field label="Phone" value={student?.phone ?? "—"} />
        <Field label="Program" value={student?.program ?? "—"} />
        <Field label="Cohort" value={student?.cohort_id ?? "—"} />
        <Field label="Status" value={student?.status ?? "Portal-only (no student record)"} />
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
