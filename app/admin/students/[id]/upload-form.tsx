"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminUploadDocForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/documents`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Upload failed.");
        setSubmitting(false);
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-rule rounded-sm p-4 space-y-3 bg-paper-subtle/40">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[180px]">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">File (max 25 MB)</span>
          <input type="file" name="file" required className="block w-full text-xs text-muted" />
        </label>
        <label className="flex-1 min-w-[140px]">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted mb-1">Label</span>
          <input type="text" name="label" placeholder="e.g. Background Check"
            className="w-full rounded-md border border-rule bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-teal" />
        </label>
        <label className="text-xs text-muted inline-flex items-center gap-1.5 cursor-pointer pb-2">
          <input type="checkbox" name="is_required" value="1" /> Required
        </label>
        <button type="submit" disabled={submitting} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
          {submitting ? "Uploading…" : "Upload"}
        </button>
      </div>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{error}</div>
      )}
    </form>
  );
}
