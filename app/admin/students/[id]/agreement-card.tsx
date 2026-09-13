"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Summary = {
  status: "none" | "sent" | "signed";
  sentAt: string | null;
  signedAt: string | null;
  signerName: string | null;
  plan: string | null;
  depositEmailSentAt: string | null;
  depositPaidAt: string | null;
  usesAgreement: boolean;
};

function fmt(ts: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  } catch { return ts; }
}

export function AgreementCard({ studentId, summary }: { studentId: string; summary: Summary }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"send" | "deposit" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function send() {
    if (busy) return;
    const label = summary.status === "sent" ? "Re-send the signing link? The old link will stop working." : "Email the enrollment agreement to this student?";
    if (!window.confirm(label)) return;
    setBusy("send"); setErr(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/agreement`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) setErr(json.error || "Send failed.");
      else { setSent(true); router.refresh(); }
    } catch { setErr("Network error."); } finally { setBusy(null); }
  }

  async function deposit(paid: boolean) {
    if (busy) return;
    setBusy("deposit"); setErr(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/agreement`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deposit_paid: paid }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) setErr(json.error || "Update failed.");
      else router.refresh();
    } catch { setErr("Network error."); } finally { setBusy(null); }
  }

  const step = (label: string, done: boolean, detail?: string) => (
    <li className="flex items-start gap-2">
      <span className={`mt-0.5 inline-block h-4 w-4 rounded-full border text-[10px] leading-4 text-center ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-rule text-transparent"}`}>✓</span>
      <span>
        <span className={done ? "text-navy" : "text-muted"}>{label}</span>
        {detail && <span className="block text-xs text-subtle">{detail}</span>}
      </span>
    </li>
  );

  return (
    <div className="card p-4">
      <div className="eyebrow mb-2">Enrollment agreement</div>
      {!summary.usesAgreement && summary.status === "none" ? (
        <div className="text-xs text-subtle">Only the Entry Level diploma uses the online agreement. EFDA / Radiography enrol through Moodle.</div>
      ) : (
        <ul className="space-y-2 text-sm">
          {step("Agreement emailed", summary.status !== "none", summary.sentAt ? fmt(summary.sentAt) : undefined)}
          {step("Signed by student", summary.status === "signed", summary.signedAt ? `${fmt(summary.signedAt)}${summary.signerName ? ` · ${summary.signerName}` : ""}` : undefined)}
          {step("$600 deposit link emailed", !!summary.depositEmailSentAt, summary.depositEmailSentAt ? fmt(summary.depositEmailSentAt) : summary.status === "signed" ? "Not sent — QBO_DEPOSIT_URL missing" : undefined)}
          {step("$600 deposit received", !!summary.depositPaidAt, summary.depositPaidAt ? fmt(summary.depositPaidAt) : undefined)}
        </ul>
      )}
      {summary.plan && <div className="mt-3 text-xs text-subtle">Plan: {summary.plan}</div>}
      <div className="mt-4 flex flex-wrap gap-2">
        {summary.status !== "signed" && (
          <button onClick={send} disabled={!!busy || sent} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
            {sent ? "Sent ✓" : busy === "send" ? "Sending…" : summary.status === "sent" ? "Re-send link" : "Send agreement"}
          </button>
        )}
        {summary.status === "signed" && !summary.depositPaidAt && (
          <button onClick={() => deposit(true)} disabled={!!busy} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50">
            {busy === "deposit" ? "Saving…" : "Deposit paid"}
          </button>
        )}
        {summary.depositPaidAt && (
          <button onClick={() => deposit(false)} disabled={!!busy} className="btn-outline text-xs py-1.5 px-3 disabled:opacity-50">Undo deposit</button>
        )}
      </div>
      {err && <div className="mt-2 text-xs text-red-700">{err}</div>}
    </div>
  );
}
