"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FREE_MAIL = /@(gmail|googlemail|yahoo|hotmail|outlook|live|icloud|aol|msn|me|proton|protonmail)\./i;

/**
 * Spam actions on a message thread.
 *  - Not spam yet → "Spam + block sender": quarantines this thread and blocks
 *    the sender so future submissions skip the inbox.
 *  - Already spam → "Not spam" puts it back in Open and unblocks the sender.
 */
export function SpamControls({
  ticketId,
  email,
  isSpam,
}: {
  ticketId: string;
  email: string;
  isSpam: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const target = FREE_MAIL.test(email) ? email : `@${email.split("@")[1] ?? ""}`;

  async function run(action: "block" | "not_spam") {
    if (busy) return;
    if (action === "block" && !confirm(`Mark as spam and block ${target}?`)) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/spam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) setErr(json?.error || "Failed.");
      else if (action === "block") router.push("/admin/tickets");
      else router.refresh();
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {isSpam ? (
        <>
          <button
            onClick={() => run("not_spam")}
            disabled={busy}
            className="text-sm px-3 py-1.5 rounded-md border border-teal text-teal-deep bg-white hover:bg-teal/5 disabled:opacity-50"
            title="Moves this back to Open and unblocks the sender"
          >
            Not spam
          </button>
          <button
            onClick={() => run("block")}
            disabled={busy}
            className="text-sm px-3 py-1.5 rounded-md border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-50"
            title={`Block ${target} — future messages go straight to Spam`}
          >
            Block {target}
          </button>
        </>
      ) : (
        <button
          onClick={() => run("block")}
          disabled={busy}
          className="text-sm px-3 py-1.5 rounded-md border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 disabled:opacity-50"
          title={`Moves this to Spam and blocks ${target} — future messages skip the inbox`}
        >
          {busy ? "Working…" : "Spam + block sender"}
        </button>
      )}
      {err && <div className="text-xs text-red-700">{err}</div>}
    </>
  );
}
