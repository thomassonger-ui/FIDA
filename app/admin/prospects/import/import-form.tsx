"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export function ImportForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/prospects/import", {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const json = await res.json();
      if (!json.ok) setError(json.error ?? "The import failed.");
      else {
        setResult(json as Result);
        router.refresh();
      }
    } catch {
      setError("Network error — nothing was imported.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-5">
      <div>
        <label
          htmlFor="file"
          className="block text-sm font-semibold text-ink mb-1"
        >
          CSV file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="block w-full text-sm border border-rule rounded-sm px-3 py-2 bg-paper"
        />
        <p className="mt-1 text-xs text-muted">
          Up to 5 MB. Column headings are matched loosely — see the list below.
        </p>
      </div>

      <div>
        <label
          htmlFor="consent_source"
          className="block text-sm font-semibold text-ink mb-1"
        >
          Where did these contacts come from?
        </label>
        <select
          id="consent_source"
          name="consent_source"
          defaultValue="purchased_list"
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper w-full"
        >
          <option value="web_form">Filled in a form on our site</option>
          <option value="event">Met at an event or school visit</option>
          <option value="referral">Referred by a student or office</option>
          <option value="purchased_list">Purchased or public list</option>
          <option value="manual">Entered by staff</option>
        </select>
        <p className="mt-1 text-xs text-muted">
          Recorded on every row. This is the answer to &ldquo;why did you email
          me?&rdquo; — worth getting right.
        </p>
      </div>

      <div>
        <label
          htmlFor="batch"
          className="block text-sm font-semibold text-ink mb-1"
        >
          Batch label <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="batch"
          name="batch"
          type="text"
          placeholder="e.g. jax-dental-offices-aug"
          className="border border-rule rounded-sm px-3 py-2 text-sm bg-paper w-full"
        />
      </div>

      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Importing…" : "Import prospects"}
      </button>

      {error && (
        <div className="border-l-4 border-red-600 bg-red-50 text-red-900 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="border border-rule bg-paper-subtle rounded-sm px-4 py-3 text-sm">
          <div className="font-semibold text-ink mb-1">Import finished</div>
          <ul className="text-muted space-y-0.5">
            <li>{result.created} added</li>
            <li>{result.updated} already on the list, updated</li>
            <li>{result.skipped} skipped (no name, email or phone)</li>
          </ul>
          {result.errors.length > 0 && (
            <div className="mt-2 text-amber-800">
              <div className="font-semibold">Rows with problems:</div>
              <ul className="list-disc pl-5">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
