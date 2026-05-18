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
  RETENTION_YEARS,
  type DocumentCategory,
} from "@/lib/demo-documents";
import { DocumentsToolbar } from "./documents-toolbar";
import { DocumentsTable, type DocRow } from "./documents-table";

export const dynamic = "force-dynamic";

type DocRecord = DocRow;

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
        <DocumentsTable docs={docs} />
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
