"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Private staff note composer (Activity tab). Students never see notes. */
export default function StudentNotes({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not save note");
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save note");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-amber-200 bg-amber-50/50 rounded-sm p-4 mb-6">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="Add a private note about this student (staff only)…"
        className="w-full bg-transparent text-sm text-ink focus:outline-none resize-y"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-subtle">Visible to staff only · stamped with your name and time</span>
        <button onClick={add} disabled={busy || !body.trim()} className="btn-primary !py-1.5 !px-4 text-xs">
          {busy ? "Saving…" : "Add note"}
        </button>
      </div>
      {error && <div className="text-xs text-red-700 mt-1">{error}</div>}
    </div>
  );
}
