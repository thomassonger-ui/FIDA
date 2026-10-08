"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Release = { name: string; relationship: string; scope: string; signed_at: string };

const SCOPES = ["all records", "financial", "academic", "attendance"];

/** FERPA release authorizations — who the student allows the school to talk to. */
export default function FerpaReleases({
  studentId,
  releases,
  canEdit,
}: {
  studentId: string;
  releases: Release[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Release>({ name: "", relationship: "", scope: SCOPES[0], signed_at: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(next: Release[]) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/record`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ferpa_releases: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setDraft({ name: "", relationship: "", scope: SCOPES[0], signed_at: "" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const input = "border border-rule bg-paper-subtle px-2 py-1.5 rounded-sm text-sm";

  return (
    <div className="border border-rule bg-paper rounded-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-paper-subtle border-b border-rule">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Authorized person</th>
            <th className="text-left px-4 py-3 font-medium">Relationship</th>
            <th className="text-left px-4 py-3 font-medium">Scope</th>
            <th className="text-left px-4 py-3 font-medium">Signed</th>
            {canEdit && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {releases.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-3 text-muted">
                No release on file — staff may not discuss this student&rsquo;s records with anyone else.
              </td>
            </tr>
          )}
          {releases.map((r, i) => (
            <tr key={i} className="border-b border-rule last:border-0">
              <td className="px-4 py-3">{r.name}</td>
              <td className="px-4 py-3 text-muted">{r.relationship}</td>
              <td className="px-4 py-3 text-muted">{r.scope}</td>
              <td className="px-4 py-3 text-muted">{r.signed_at}</td>
              {canEdit && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => save(releases.filter((_, j) => j !== i))}
                    disabled={busy}
                    className="text-xs text-red-700 hover:underline"
                  >
                    Revoke
                  </button>
                </td>
              )}
            </tr>
          ))}
          {canEdit && (
            <tr className="bg-paper-subtle/50">
              <td className="px-4 py-2"><input className={input} placeholder="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></td>
              <td className="px-4 py-2"><input className={input} placeholder="Parent, spouse…" value={draft.relationship} onChange={(e) => setDraft({ ...draft, relationship: e.target.value })} /></td>
              <td className="px-4 py-2">
                <select className={input} value={draft.scope} onChange={(e) => setDraft({ ...draft, scope: e.target.value })}>
                  {SCOPES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-2"><input type="date" className={input} value={draft.signed_at} onChange={(e) => setDraft({ ...draft, signed_at: e.target.value })} /></td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => save([...releases, draft])}
                  disabled={busy || !draft.name.trim() || !draft.relationship.trim() || !draft.signed_at}
                  className="text-xs border border-rule rounded-sm px-3 py-1.5 hover:border-teal disabled:opacity-40"
                >
                  Add release
                </button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {error && <div className="text-xs text-red-700 px-4 py-2">{error}</div>}
    </div>
  );
}
