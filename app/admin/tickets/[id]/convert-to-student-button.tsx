"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConvertToStudentButton({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function convert() {
    if (busy) return;
    if (!confirm("Create a student record from this ticket and send them a portal invite?")) return;
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.set("send_invite", "1");
      const res = await fetch(`/api/admin/tickets/${ticketId}/convert-to-student`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErr(json.error || "Convert failed.");
      } else {
        router.refresh();
      }
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={convert}
        disabled={busy}
        className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
        title="Create a student record + send portal invite. Future replies route through the portal."
      >
        {busy ? "Converting…" : "Convert to student"}
      </button>
      {err && <div className="text-xs text-red-700">{err}</div>}
    </>
  );
}
