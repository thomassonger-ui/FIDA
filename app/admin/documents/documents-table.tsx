"use client";

/**
 * Client-side table for the Document Vault.
 *
 * Adds row checkboxes, "Select all", and a floating "Download N as ZIP"
 * button. Bulk download POSTs to /api/admin/documents/bulk-download
 * which streams back a ZIP archive.
 *
 * Receives the docs list as a prop from the parent server component.
 */

import { useMemo, useState } from "react";
import {
  categoryLabel,
  categoryTone,
  type DocumentCategory,
} from "@/lib/demo-documents";

export type DocRow = {
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

export function DocumentsTable({ docs }: { docs: DocRow[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Case-insensitive substring match across student name, student ID, and filename.
  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => {
      const hay = [
        d.student_name,
        d.student_id ?? "",
        d.filename,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [docs, query]);

  // "Select all" applies to the currently visible (filtered) set.
  const visibleIds = useMemo(
    () => new Set(filteredDocs.map((d) => d.id)),
    [filteredDocs]
  );
  const visibleSelected = filteredDocs.filter((d) => selected.has(d.id)).length;
  const allSelected =
    filteredDocs.length > 0 && visibleSelected === filteredDocs.length;
  const someSelected = visibleSelected > 0 && !allSelected;

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        // Unselect everything currently visible.
        for (const id of visibleIds) next.delete(id);
      } else {
        // Select everything currently visible.
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  };

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const downloadZip = async () => {
    if (selected.size === 0) return;
    setError(null);
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/documents/bulk-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) {
        let msg = "Download failed.";
        try {
          const j = await res.json();
          msg = j?.error ?? msg;
        } catch {
          /* ignore parse errors */
        }
        setError(msg);
        return;
      }
      const blob = await res.blob();
      // Pull filename from Content-Disposition if present, else default.
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="([^"]+)"/.exec(cd);
      const filename = match?.[1] ?? `fida-vault-${Date.now()}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  // Note: we DON'T early-return on filteredDocs.length === 0 anymore — we
  // still want the search bar visible so the user can clear / refine the
  // query without losing context.

  const vaultEmpty = docs.length === 0;

  return (
    <>
      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name, ID, or filename…"
            className="w-full md:max-w-md px-3 py-2 pr-8 text-sm border border-rule rounded-sm bg-paper-subtle focus:border-ink focus:outline-none"
            aria-label="Search documents"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-xs text-muted">
          {query ? (
            <>
              Showing <strong className="text-ink">{filteredDocs.length}</strong>{" "}
              of {docs.length}
              {selected.size > 0 && (
                <>
                  {" · "}
                  <strong className="text-ink">{selected.size}</strong> selected{" "}
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    (clear)
                  </button>
                </>
              )}
            </>
          ) : selected.size > 0 ? (
            <>
              <strong className="text-ink">{selected.size}</strong> selected
              {" · "}
              <button
                onClick={() => setSelected(new Set())}
                className="text-blue-700 hover:text-blue-900 hover:underline"
              >
                Clear
              </button>
            </>
          ) : (
            <>Select rows to download as ZIP</>
          )}
        </div>
        <button
          onClick={downloadZip}
          disabled={selected.size === 0 || downloading}
          className="px-3 py-1.5 text-xs rounded-sm bg-ink text-paper hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {downloading
            ? "Building ZIP…"
            : selected.size === 0
            ? "Download as ZIP"
            : `Download ${selected.size} as ZIP`}
        </button>
      </div>

      {vaultEmpty && (
        <div className="border border-rule rounded-sm p-8 text-center text-sm text-muted bg-paper-subtle">
          No documents in the vault yet. Click <strong>Upload document</strong>{" "}
          above to add the first one.
        </div>
      )}

      {!vaultEmpty && filteredDocs.length === 0 && (
        <div className="border border-rule rounded-sm p-8 text-center text-sm text-muted bg-paper-subtle">
          No matches for <strong className="text-ink">&ldquo;{query}&rdquo;</strong>.{" "}
          <button
            onClick={() => setQuery("")}
            className="text-blue-700 hover:text-blue-900 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {error && (
        <div className="mb-3 border border-red-200 bg-red-50 text-red-900 rounded-sm px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {filteredDocs.length > 0 && (
        <div className="border border-rule rounded-sm overflow-x-auto">
          <table className="w-full text-sm">
          <thead className="bg-paper-subtle text-left">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="cursor-pointer"
                  aria-label="Select all"
                />
              </th>
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
            {filteredDocs.map((doc) => {
              const isChecked = selected.has(doc.id);
              return (
                <tr
                  key={doc.id}
                  className={`border-t border-rule transition-colors ${
                    isChecked ? "bg-blue-50/40" : "hover:bg-paper-subtle"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRow(doc.id)}
                      className="cursor-pointer"
                      aria-label={`Select ${doc.filename}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <LockIcon locked={doc.locked} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink font-medium">
                      {doc.student_name}
                    </div>
                    {doc.student_id && (
                      <div className="text-[11px] text-subtle">
                        ID {doc.student_id}
                      </div>
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
                    <div className="text-[10px] text-subtle">
                      {doc.uploaded_by}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    <div>{doc.retention_years}yr</div>
                    <div className="text-[10px] text-subtle">
                      Expires {fmtDate(doc.retention_expires)}
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
