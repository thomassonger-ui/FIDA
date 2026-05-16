import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { resolvePortalStudent } from "@/lib/students-db";
import { PortalNewTicketForm } from "./new-form";

export const dynamic = "force-dynamic";

export default async function PortalNewTicketPage() {
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
  if (!user?.email) redirect("/portal/login");
  const student = await resolvePortalStudent({ userId: user.id, email: user.email });

  return (
    <div className="max-w-2xl">
      <div className="eyebrow mb-3">New ticket</div>
      <h1 className="text-3xl md:text-4xl mb-2">Tell us what&rsquo;s going on</h1>
      <p className="text-muted mb-8">
        A FIDA staff member will reply here — you&rsquo;ll see the response when
        you sign back in.
      </p>
      <PortalNewTicketForm defaultProgram={student?.program ?? ""} />
    </div>
  );
}
