import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalStudent } from "@/lib/portal-auth";
import { idCardData } from "@/lib/sis-card";
import IdCard from "@/components/sis/IdCard";
import PrintCard from "@/components/sis/PrintCard";

export const dynamic = "force-dynamic";

export default async function PortalIdCardPage() {
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");
  const card = await idCardData(student as unknown as Record<string, unknown>);

  return (
    <div className="max-w-md">
      <div className="eyebrow mb-3 print:hidden">My student ID</div>
      <div className="mb-6">
        <IdCard {...card} />
      </div>
      <div className="print:hidden">
        <PrintCard />
        <p className="text-xs text-muted mt-3">
          Show this card on your phone or print it. The barcode is your Student ID.
          {!card.photoUrl && (
            <> Add your photo under <Link href="/portal/profile" className="text-teal underline underline-offset-2">Profile</Link> first.</>
          )}
        </p>
      </div>
    </div>
  );
}
