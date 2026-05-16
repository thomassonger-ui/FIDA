"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SendInviteButton({ studentId, status }: { studentId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/invite`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErr(json.error || "Send failed.");
      } else {
        setDone(true);
        router.refresh();
      }
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  }

  const label = status === "active" ? "Resend portal link" : "Send portal invite";

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={send} disabled={busy || done} className="btn-primary disabled:opacity-50">
        {done ? "Sent ✓" : busy ? "Sending…" : label}
      </button>
      {err && <div className="text-xs text-red-700">{err}</div>}
    </div>
  );
}
