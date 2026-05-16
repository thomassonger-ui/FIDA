import Link from "next/link";
import { NewStudentForm } from "./new-form";

export const metadata = { title: "New student — FIDA Admin" };

export default function NewStudentPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-3">Students</div>
        <h1 className="text-3xl md:text-4xl mb-2">New student</h1>
        <p className="text-muted max-w-prose">
          Create a student record and optionally send them a one-click portal
          invite. For bulk imports, use the{" "}
          <Link href="/admin/students/upload" className="underline">CSV importer</Link>{" "}
          instead.
        </p>
      </div>
      <NewStudentForm />
    </div>
  );
}
