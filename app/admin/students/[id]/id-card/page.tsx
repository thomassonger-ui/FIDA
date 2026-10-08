import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudentById } from "@/lib/students-db";
import { idCardData } from "@/lib/sis-card";
import IdCard from "@/components/sis/IdCard";
import PrintCard from "@/components/sis/PrintCard";

export const dynamic = "force-dynamic";

export default async function IdCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();
  const card = await idCardData(student as unknown as Record<string, unknown>);

  return (
    <div>
      <div className="mb-6 print:hidden">
        <Link href={`/admin/students/${id}`} className="text-xs text-muted hover:text-teal">&larr; Student file</Link>
      </div>
      <div className="eyebrow mb-3 print:hidden">Student ID card</div>
      <div className="mb-6">
        <IdCard {...card} />
      </div>
      <div className="flex items-center gap-4 print:hidden">
        <PrintCard />
        <span className="text-xs text-muted">
          The barcode encodes the Student ID — scan it for attendance, library or building access.
          {!card.photoUrl && " Add a photo on the student file first."}
        </span>
      </div>
    </div>
  );
}
