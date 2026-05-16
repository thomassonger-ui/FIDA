"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_LABELS, type TicketStatus } from "@/lib/tickets-db";

export function StatusControls({
  ticketId,
  current,
  options,
}: {
  ticketId: string;
  current: TicketStatus;
  options: TicketStatus[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(s: TicketStatus) {
    if (busy || s === current) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <select
      value={current}
      disabled={busy}
      onChange={(e) => setStatus(e.target.value as TicketStatus)}
      className="text-xs border border-rule rounded-md bg-white px-2 py-1.5 text-navy outline-none focus:border-teal"
    >
      {options.map((s) => (
        <option key={s} value={s}>
          Set: {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
