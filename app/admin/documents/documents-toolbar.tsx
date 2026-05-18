"use client";

/**
 * Client-side upload UI for the Document Vault.
 *
 * Renders the "Upload document" toggle button + the upload form when open.
 * Form POSTs to /api/admin/documents (multipart). On success, the page
 * reloads so the server component refetches the table.
 *
 * Lives next to app/admin/documents/page.tsx (which is a server component).
 */

import { useState, useRef, type FormEvent } from "react";
import type { DocumentCategory } from "@/lib/demo-documents";

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

const RETENTION_YEARS: Record<DocumentCategory, number> = {
  enrollment_agreement: 6,
  financial_disclosure: 6,
  id_verification: 5,
  transcript: 50,
  sap_notice: 6,
  appeal_decision: 6,
  placement_verification: 5,
  other: 3,
};

function UploadPanel({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState<DocumentCategory>(
    "enrollment_agreement"
  );
  const [program, setProgram] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10 MB limit.");
      return;
    }
    if (!studentName.trim()) {
      setError("Student name is required.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("student_name", studentName.trim());
      fd.append("student_id", studentId.trim());
      fd.append("category", category);
      if (program) fd.append("program", program);
      fd.append("notes", notes.trim());

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Upload failed.");
        return;
      }
      // Reload so the server component refetches the vault.
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-rule rounded-sm bg-paper p-6 mb-10">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex items-start justify-between gap-6">
          <div className="eyebrow">Upload document</div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">
              Student name <span className="text-red-700">*</span>
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-rule rounded-sm bg-paper-subtle focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">
              Student ID <span className="text-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-rule rounded-sm bg-paper-subtle focus:border-ink focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">
            Category <span className="text-red-700">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            className="w-full px-3 py-2 text-sm border border-rule rounded-sm bg-paper-subtle focus:border-ink focus:outline-none"
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
            Program <span className="text-muted">(optional)</span>
          </label>
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-rule rounded-sm bg-paper-subtle focus:border-ink focus:outline-none"
          >
            <option value="">— Not specified —</option>
            <option value="efda">EFDA (Expanded Functions Dental Assistant)</option>
            <option value="rdp_ce">RDP-CE (Radiography for Dental Personnel)</option>
            <option value="both">Both programs</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">
            File <span className="text-red-700">*</span>{" "}
            <span className="text-muted">(max 10 MB)</span>
          </label>
          <input
            ref={fileRef}
            type="file"
            required
            className="block w-full text-sm text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-sm file:border file:border-rule file:bg-paper-subtle file:text-ink file:cursor-pointer hover:file:bg-paper"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">
            Notes <span className="text-muted">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any context for auditors"
            className="w-full px-3 py-2 text-sm border border-rule rounded-sm bg-paper-subtle focus:border-ink focus:outline-none resize-none"
          />
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 text-red-900 rounded-sm px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 text-sm rounded-sm bg-ink text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Uploading…" : "Upload & lock"}
          </button>
          <p className="text-xs text-muted">
            File will be hashed (SHA-256) and locked on upload. Cannot be
            modified or deleted after submission.
          </p>
        </div>
      </form>
    </div>
  );
}

export function DocumentsToolbar() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowUpload(!showUpload)}
        className="px-4 py-2 text-sm rounded-sm bg-ink text-paper hover:bg-ink/90 transition-colors shrink-0"
      >
        {showUpload ? "Cancel" : "Upload document"}
      </button>
      {showUpload && (
        <div className="absolute inset-x-0 mt-16 px-4 md:px-8">
          {/* Render the panel below in the page flow via a portal-like wrapper.
              Simpler: hoist UploadPanel into page flow by always rendering and
              hiding. But since this is a client island, we render below the
              header instead. */}
        </div>
      )}
      {/* Render in-place below the header by mounting alongside */}
      {showUpload && (
        <ToolbarPanel onClose={() => setShowUpload(false)} />
      )}
    </>
  );
}

// Renders the upload form just below the toolbar, in-page. We can't easily
// place it "below the header" without restructuring page.tsx, so we mount
// it as a fixed-position block. Acceptable for now.
function ToolbarPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-ink/50">
      <div className="w-full max-w-2xl">
        <UploadPanel onClose={onClose} />
      </div>
    </div>
  );
}
