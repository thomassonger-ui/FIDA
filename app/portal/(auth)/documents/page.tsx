import { redirect } from "next/navigation";
import { listStudentDocuments, signedDocumentUrl } from "@/lib/students-db";
import { getPortalStudent } from "@/lib/portal-auth";
import { UploadDocForm } from "./upload-form";

export const dynamic = "force-dynamic";

function fmt(ts: string) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch { return ts; }
}

export default async function PortalDocumentsPage() {
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");
  const docs = await listStudentDocuments(student.id);
  const signed: Record<number, string | null> = {};
  for (const d of docs) signed[d.id] = await signedDocumentUrl(d.storage_path);

  return (
    <div className="max-w-4xl">
      <div className="eyebrow mb-3">Documents</div>
      <h1 className="text-3xl md:text-4xl mb-2">Your document vault</h1>
      <p className="text-muted mb-8">
        Files shared between you and the FIDA team. Staff can upload here too.
      </p>

      <UploadDocForm />

      <div className="mt-8">
        {docs.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted">
            No documents yet. Upload something with the form above, or wait
            for FIDA staff to add files here.
          </div>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-navy truncate">
                    {d.label ? `${d.label}: ${d.filename}` : d.filename}
                    {d.is_required && (
                      <span className="ml-2 inline-block text-[10px] font-semibold tracking-wider uppercase text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-subtle mt-1">
                    Uploaded {fmt(d.created_at)} by {d.uploaded_by} · {Math.round(d.size_bytes / 1024)} KB
                  </div>
                </div>
                {signed[d.id] && (
                  <a href={signed[d.id]!} target="_blank" rel="noreferrer" className="btn-outline text-sm py-1.5 px-3">
                    Download
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
