import { redirect } from "next/navigation";
import { getPortalStudent } from "@/lib/portal-auth";
import { PortalNewTicketForm } from "./new-form";

export const dynamic = "force-dynamic";

export default async function PortalNewTicketPage() {
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");

  return (
    <div className="max-w-2xl">
      <div className="eyebrow mb-3">New message</div>
      <h1 className="text-3xl md:text-4xl mb-2">Tell us what&rsquo;s going on</h1>
      <p className="text-muted mb-8">
        A FIDA staff member will reply here — you&rsquo;ll see the response when
        you sign back in. All replies stay inside the portal for compliance.
      </p>
      <PortalNewTicketForm defaultProgram={student.program ?? ""} />
    </div>
  );
}
