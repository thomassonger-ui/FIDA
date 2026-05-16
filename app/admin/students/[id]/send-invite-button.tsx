"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SendInviteButton({ studentId, status }: { studentId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"send" | "link" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function sendInvite() {
    if (busy) return;
    setBusy("send"); setErr(null); setDone(false); setLink(null);
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
      setBusy(null);
    }
  }

  async function getLink() {
    if (busy) return;
    setBusy("link"); setErr(null); setDone(false); setLink(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/sign-in-link`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErr(json.error || "Could not generate link.");
      } else {
        setLink(json.url);
      }
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }

  const sendLabel = status === "active" ? "Resend portal link" : "Send portal invite";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <button onClick={getLink} disabled={!!busy} className="btn-outline disabled:opacity-50 text-sm">
          {busy === "link" ? "Generating…" : "Get sign-in link"}
        </button>
        <button onClick={sendInvite} disabled={!!busy || done} className="btn-primary disabled:opacity-50">
          {done ? "Sent ✓" : busy === "send" ? "Sending…" : sendLabel}
        </button>
      </div>
      {err && <div className="text-xs text-red-700">{err}</div>}
      {link && (
        <div className="mt-2 w-full max-w-md border border-teal/40 bg-teal/5 rounded-md p-3 text-xs">
          <div className="font-semibold text-navy mb-1.5">One-time sign-in link (no email sent)</div>
          <div className="break-all text-muted bg-white border border-rule rounded px-2 py-1.5 mb-2 font-mono text-[11px]">
            {link}
          </div>
          <div className="flex items-center justify-between gap-2">
            <button onClick={copyLink} className="text-teal hover:underline">
              {copied ? "Copied ✓" : "Copy"}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="text-teal hover:underline"
            >
              Open in new tab →
            </a>
          </div>
          <div className="mt-2 text-[10px] text-subtle">
            One use, expires shortly. Paste into Incognito to test the portal without affecting your admin session.
          </div>
        </div>
      )}
    </div>
  );
}
