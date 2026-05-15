/**
 * Document Vault / Audit Locker page.
 *
 * Shows all documents in the vault with SHA-256 hashes, upload
 * timestamps, retention schedules, and WORM lock status. Includes
 * an upload form for adding new documents.
 *
 * Architecture: Supabase Storage + hash chain (Option 2).
 * Production should upgrade to S3 Object Lock for true WORM.
 */

"use client";

import { useState, useRef, type FormEvent } from "react";
import {
  demoDocuments,
  categoryLabel,
  categoryTone,
  RETENTION_YEARS,
  type DocumentCategory,
  type DocumentRecord,
} from "@/lib/demo-documents";

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Upload modal                                                       */
/* ------------------------------------------------------------------ */

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

function UploadPanel({
  onClose,
  onUploaded,
}: {
  onClose: () => void;
  onUploaded: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const form = formRef.current;
    if (!form) return;

    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("Select a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Upload failed.");
        return;
      }
      onUploaded(
        `Uploaded successfully. SHA-256: ${(json.hash as string)?.slice(0, 16)}\u2026`
      );
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border border-rule bg-paper rounded-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="eyebrow">Upload document</div>
        <button
          onClick={onClose}
          className="text-xs text-muted hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">
              Student name <span className="text-red-600">*</span>
            </label>
            <input
              name="student_name"
              type="text"
              required
              className="w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-teal"
              placeholder="e.g. Sarah Chen"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">
              Student ID (optional)
            </label>
            <input
              name="student_id"
              type="text"
              className="w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-teal"
              placeholder="e.g. 1001"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            Category <span className="text-red-600">*</span>
          </label>
          <select
            name="category"
            required
            className="w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-teal"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} ({RETENTION_YEARS[o.value]}yr retention)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            File <span className="text-red-600">*</span>{" "}
            <span className="text-subtle">(max 10 MB)</span>
          </label>
          <input
            name="file"
            type="file"
            required
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-rule file:text-xs file:bg-paper-subtle file:text-ink file:cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            rows={2}
            className="w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper text-ink focus:outline-none focus:ring-1 focus:ring-teal"
            placeholder="Any context for auditors"
          />
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 text-sm rounded-sm bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {uploading ? "Uploading\u2026" : "Upload & lock"}
          </button>
          <span className="text-[10px] text-subtle">
            File will be hashed (SHA-256) and locked on upload. Cannot be
            modified or deleted after submission.
          </span>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DocumentsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const docs = demoDocuments(2); // Medical Assisting cohort

  const totalDocs = docs.length;
  const locked = docs.filter((d) => d.locked).length;
  const categories = new Set(docs.map((d) => d.category));
  const students = new Set(docs.map((d) => d.studentName));
  const totalSizeKb = docs.reduce((s, d) => s + d.fileSizeKb, 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-2">
        <div>
          <div className="eyebrow mb-3">Compliance</div>
          <h1 className="text-3xl md:text-4xl mb-2">Document Vault</h1>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 text-sm rounded-sm bg-ink text-paper hover:bg-ink/90 transition-colors shrink-0"
        >
          {showUpload ? "Cancel" : "Upload document"}
        </button>
      </div>
      <p className="text-muted max-w-prose mb-8">
        Immutable document storage with SHA-256 integrity hashing and
        retention scheduling. Every file is locked on upload &mdash; no
        edits, no deletions until the retention period expires.
      </p>

      {/* Toast */}
      {toast && (
        <div className="mb-6 border border-green-200 bg-green-50 text-green-900 rounded-sm px-4 py-2 text-sm flex items-center justify-between">
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="text-green-700 hover:text-green-900 text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload panel */}
      {showUpload && (
        <UploadPanel
          onClose={() => setShowUpload(false)}
          onUploaded={(msg) => {
            setToast(msg);
            setTimeout(() => setToast(null), 8000);
          }}
        />
      )}

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
          <strong>Current (demo):</strong> Supabase Storage + SHA-256 hash
          chain. Each file is hashed at upload time and the hash is stored in
          a{" "}
          <code className="font-mono text-xs bg-blue-100 px-1">
            document_records
          </code>{" "}
          table. Tampering can be detected but not prevented at the storage
          layer.
        </p>
        <p className="text-sm text-blue-950 leading-relaxed">
          <strong>Production upgrade:</strong> Amazon S3 with Object Lock in
          compliance mode. Once a file is written, nobody &mdash; not even the
          root AWS account &mdash; can delete or modify it until retention
          expires. This is true WORM (Write Once Read Many) and satisfies
          accreditor and federal audit requirements.
        </p>
      </div>

      {/* Document table */}
      <section className="mb-14">
        <div className="eyebrow mb-4">
          Vault contents &middot; Medical Assisting cohort
        </div>
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

      {/* Production entry callout */}
      <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3 mb-6">
        <div className="text-[10px] uppercase tracking-wider text-amber-900 font-medium mb-1">
          How data enters this page in production
        </div>
        <p className="text-sm text-amber-950 leading-relaxed mb-2">
          Documents are uploaded by authorized staff (admissions, registrar,
          career services) through the upload form. On submission, the server
          computes a SHA-256 hash, stores the file in the vault bucket, and
          writes a record with the hash, uploader identity, timestamp, and
          retention schedule. The file is immediately locked &mdash; no
          staff member can edit or delete it.
        </p>
        <p className="text-sm text-amber-950 leading-relaxed">
          Required documents per student: enrollment agreement, financial
          responsibility disclosure, government ID scan, official transcript,
          and any SAP notices or appeal decisions generated during enrollment.
          Missing documents should surface as a compliance gap on the student
          profile.
        </p>
      </div>

      <p className="text-xs text-subtle">
        Demo data &middot; hashes are deterministic placeholders, not real
        SHA-256 digests. Upload button connects to Supabase Storage when
        configured.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table row                                                          */
/* ------------------------------------------------------------------ */

function DocRow({ doc }: { doc: DocumentRecord }) {
  return (
    <tr className="border-t border-rule hover:bg-paper-subtle transition-colors">
      <td className="px-4 py-3">
        <LockIcon locked={doc.locked} />
      </td>
      <td className="px-4 py-3">
        <div className="text-ink font-medium">{doc.studentName}</div>
        <div className="text-[11px] text-subtle">{doc.studentEmail}</div>
      </td>
      <td className="px-4 py-3">
        <CategoryBadge category={doc.category} />
      </td>
      <td className="px-4 py-3">
        <div className="text-xs text-ink font-mono truncate max-w-[200px]">
          {doc.filename}
        </div>
        <div className="text-[10px] text-subtle">{doc.fileSizeKb} KB</div>
      </td>
      <td className="px-4 py-3">
        <code className="text-[10px] text-subtle font-mono">
          {doc.sha256.slice(0, 16)}&hellip;
        </code>
      </td>
      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
        <div>{fmtDateTime(doc.uploadedAt)}</div>
        <div className="text-[10px] text-subtle">{doc.uploadedBy}</div>
      </td>
      <td className="px-4 py-3 text-xs text-muted">
        <div>{doc.retentionYears}yr</div>
        <div className="text-[10px] text-subtle">
          Expires {fmtDate(doc.retentionExpires)}
        </div>
      </td>
    </tr>
  );
}
