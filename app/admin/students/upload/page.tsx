import { StudentUploader } from "@/components/admin/StudentUploader";

export const dynamic = "force-dynamic";

export default function StudentUploadPage() {
  return (
    <div>
      <div className="eyebrow mb-3">Students</div>
      <h1 className="text-3xl md:text-4xl mb-2">Import students</h1>
      <p className="text-muted max-w-prose mb-8">
        Drop a CSV or Excel file, or paste a Google Sheet link. We&rsquo;ll
        detect the columns, let you map them to student fields, and preview
        what will land in the database before you commit.
      </p>
      <StudentUploader />
    </div>
  );
}
