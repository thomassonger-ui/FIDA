/**
 * Document Vault — live, not demo.
 *
 * Server component. Fetches all rows from public.document_records via
 * the service-role server client, computes KPIs server-side, and renders
 * the table. Upload UI is in a sibling client component to keep this
 * page free of "use client".
 *
 * Architecture: Supabase Storage + SHA-256 hash chain + DB-level WORM
 * triggers (see migration: create_document_records_with_worm_triggers).
 * Production upgrade path is S3 Object Lock for true compliance-mode WORM.
 */

import { getServerClient } from "@/lib/supabase";
import {
  categoryLabel,
  categoryTone,
  RETENTION_YEARS,
  type DocumentCategory,
} from "@/lib/demo-documents";
import { DocumentsToolbar } from "./documents-toolbar";

export const dynamic = "force-dynamic";

type DocRecord = {
  id: number;
  student_id: string | null;
  student_name: string;
  category: DocumentCategory;
  filename: string;
  file_size_kb: number;
  mime_type: string;
  storage_path: string;
  sha256: string;
  uploaded_by: string;
  uploaded_at: string;
  retention_years: number;
  retention_expires: string;
  locked: boolean;
  notes: string | null;
};

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "enrollment_agreement", label: "Enrollment agreement" },
  { value: "financial_disclosure", label: "Financial disclosure" },
  { value: "id_verification", label: "ID verification" },
  { value: "transcript", label: "Transcript" },
  { value: "sap_notice", label: "SAP notice" },
  { value: "appeal_decision", label: "Appeal decision" },
  { value: "placement_verification", label: "Placement verification" },
  { value: "other", label: "Other" },
];

async function fetchDocs(): Promise<DocRecord[]> {
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("document_records")
      .select(
        "id, student_id, student_name, category, filename, file_size_kb, mime_type, storage_path, sha256, uploaded_by, uploaded_at, retention_years, retention_expires, locked, notes"
      )
      .order("uploaded_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error("[admin/documents] fetch error:", error.message);
      return [];
    }
    return (data ?? []) as DocRecord[];
  } catch (err) {
    console.error("[admin/documents] fetch threw:", err);
    return [];
  }
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CategoryBadge({ category }: { category: DocumentCategory }) {
  const tone = categoryTone(category);
  const cls =
    tone === "blue"
      ? "bg-blue-50 text-blue-900 border-blue-200"
      : tone === "green"
      ? "bg-green-50 text-green-900 border-green-200"
      : tone === "amber"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : tone === "red"
      ? "bg-red-50 text-red-900 border-red-200"
      : "bg-paper-subtle text-muted border-rule";
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${cls}`}
    >
      {categoryLabel(category)}
    </span>
  );
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
        locked
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
      title={locked ? "WORM locked" : "Unlocked"}
      aria-label={locked ? "Locked" : "Unlocked"}
    >
      {locked ? "\u{1F512}" : "\u{1F513}"}
    </span>
  );
}

function DocRow({ doc }: { doc: DocRecord }) {
  return (
    <tr className="border-t border-rule hover:bg-paper-subtle transition-colors">
      <td className="px-4 py-3">
        <LockIcon locked={doc.locked} />
      </td>
      <td className="px-4 py-3">
        <div className="text-ink font-medium">{doc.student_name}</div>
        {doc.student_id && (
          <div className="text-[11px] text-subtle">ID {doc.student_id}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <CategoryBadge category={doc.category} />
      </td>
      <td className="px-4 py-3">
        <a
          href={`/api/admin/documents/${doc.id}/download`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-700 hover:text-blue-900 hover:underline font-mono truncate max-w-[200px] inline-block"
          title="Open in new tab (60s signed link)"
        >
          {doc.filename}
        </a>
        <div className="text-[10px] text-subtle">
          {doc.file_size_kb} KB &middot;{" "}
          <a
            href={`/api/admin/documents/${doc.id}/download?download=1`}
            className="text-blue-700 hover:text-blue-900 hover:underline"
            title="Download to disk"
          >
            Download
          </a>
        </div>
      </td>
      <td className="px-4 py-3">
        <code className="text-[10px] text-subtle font-mono">
          {doc.sha256.slice(0, 16)}&hellip;
        </code>
      </td>
      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
        <div>{fmtDateTime(doc.uploaded_at)}</div>
        <div className="text-[10px] text-subtle">{doc.uploaded_by}</div>
      </td>
      <td className="px-4 py-3 text-xs text-muted">
        <div>{doc.retention_years}yr</div>
        <div className="text-[10px] text-subtle">
          Expires {fmtDate(doc.retention_expires)}
        </div>
      </td>
    </tr>
  );
}

export default async function DocumentsPage() {
  const docs = await fetchDocs();

  const totalDocs = docs.length;
  const locked = docs.filter((d) => d.locked).length;
  const categories = new Set(docs.map((d) => d.category));
  const students = new Set(
    docs.map((d) => d.student_id ?? d.student_name).filter(Boolean)
  );
  const totalSizeKb = docs.reduce((s, d) => s + d.file_size_kb, 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-2">
        <div>
          <div className="eyebrow mb-3">Compliance</div>
          <h1 className="text-3xl md:text-4xl mb-2">Document Vault</h1>
        </div>
        <DocumentsToolbar />
      </div>
      <p className="text-muted max-w-prose mb-8">
        Immutable document storage with SHA-256 integrity hashing and
        retention scheduling. Every file is locked on upload &mdash; no
        edits, no deletions until the retention period expires.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-ink">{totalDocs}</div>
          <div className="eyebrow mt-1">Documents</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-green-800">{locked}</div>
          <div className="eyebrow mt-1">WORM locked</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-ink">
            {students.size}
          </div>
          <div className="eyebrow mt-1">Students</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-ink">
            {categories.size}
          </div>
          <div className="eyebrow mt-1">Categories</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-ink">
            {(totalSizeKb / 1024).toFixed(1)}
          </div>
          <div className="eyebrow mt-1">MB stored</div>
        </div>
      </div>

      {/* WORM architecture callout */}
      <div className="border-l-2 border-blue-300 bg-blue-50/60 rounded-r-sm px-4 py-3 mb-10">
        <div className="text-[10px] uppercase tracking-wider text-blue-900 font-medium mb-1">
          Storage architecture
        </div>
        <p className="text-sm text-blue-950 leading-relaxed mb-2">
          Supabase Storage + SHA-256 hash chain + database-level WORM triggers.
          Every file is hashed at upload time; the hash and metadata are stored
          in a{" "}
          <code className="font-mono text-xs bg-blue-100 px-1">
            document_records
          </code>{" "}
          table that disallows UPDATE or DELETE of locked rows. Tampering can
          be detected at the storage layer and is blocked at the database layer.
        </p>
        <p className="text-sm text-blue-950 leading-relaxed">
          <strong>Production upgrade path:</strong> Amazon S3 with Object Lock
          in compliance mode. Once a file is written, nobody &mdash; not even
          the root AWS account &mdash; can delete or modify it until retention
          expires. That is true WORM (Write Once Read Many) and satisfies
          accreditor and federal audit requirements.
        </p>
      </div>

      {/* Document table */}
      <section className="mb-14">
        <div className="eyebrow mb-4">Vault contents</div>
        {docs.length === 0 ? (
          <div className="border border-rule rounded-sm p-8 text-center text-sm text-muted bg-paper-subtle">
            No documents in the vault yet. Click <strong>Upload document</strong>{" "}
            above to add the first one.
          </div>
        ) : (
          <div className="border border-rule rounded-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paper-subtle text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                    Lock
                  </th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                    Student
                  </th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                    Filename
                  </th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                    SHA-256
                  </th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                    Uploaded
                  </th>
                  <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider text-muted">
                    Retention
                  </th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <DocRow key={doc.id} doc={doc} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Retention schedule */}
      <section className="mb-10">
        <div className="eyebrow mb-4">Retention schedule</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORY_OPTIONS.map((o) => (
            <div
              key={o.value}
              className="border border-rule bg-paper rounded-sm p-3"
            >
              <div className="text-xs text-ink font-medium">{o.label}</div>
              <div className="text-lg font-display text-ink mt-1">
                {RETENTION_YEARS[o.value]}
                <span className="text-xs text-muted ml-1">years</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Operational callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mb-6">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How documents enter the vault
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Authorized staff (admissions, registrar, career services) upload
          documents through the form above. On submission, the server
          computes a SHA-256 hash, stores the file in the vault bucket, and
          writes a record with the hash, uploader identity, timestamp, and
          retention schedule. The file is immediately WORM-locked at the
          database level &mdash; no row update or delete will succeed.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          Required documents per student: enrollment agreement, financial
          responsibility disclosure, government ID scan, official transcript,
          and any SAP notices or appeal decisions generated during enrollment.
          Missing documents should surface as a compliance gap on the student
          profile.
        </p>
      </div>
    </div>
  );
}
