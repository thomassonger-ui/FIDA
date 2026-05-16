"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UploadDocForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/portal/documents/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Upload failed. Try again.");
        setSubmitting(false);
        return;
      }
      form.reset();
      setFilename(null);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <div className="eyebrow">Upload a document</div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[200px]">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            File <span className="text-subtle font-normal">(max 25 MB)</span>
          </span>
          <input
            type="file" name="file" required
            onChange={(e) => setFilename(e.target.files?.[0]?.name ?? null)}
            className="block w-full text-sm text-muted"
          />
        </label>
        <label className="flex-1 min-w-[200px]">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            Label (optional)
          </span>
          <input
            type="text" name="label" placeholder="e.g. Background Check"
            className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal"
          />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
          {submitting ? "Uploading…" : "Upload"}
        </button>
      </div>
      {filename && (
        <div className="text-xs text-subtle">{filename} ready to upload</div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
      )}
    </form>
  );
}
