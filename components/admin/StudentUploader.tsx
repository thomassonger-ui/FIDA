"use client";

import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  STUDENT_FIELDS,
  autoMapColumns,
  mapAndNormalize,
  type StudentField,
} from "@/lib/student-import";

type ParsedData = {
  headers: string[];
  rows: Record<string, unknown>[];
  sourceLabel: string;
};

type ImportResult = {
  inserted: number;
  skipped: number;
  errors: { rowIndex: number; reason: string }[];
};

// Convert a Google Sheets URL to its CSV export URL.
function googleSheetToCsvUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("google.com")) return null;
    const m = u.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!m) return null;
    const id = m[1];
    // Respect gid if present in fragment or query
    const gid =
      u.hash.match(/gid=(\d+)/)?.[1] ??
      u.searchParams.get("gid") ??
      "0";
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
  } catch {
    return null;
  }
}

export function StudentUploader() {
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [mapping, setMapping] = useState<Record<string, StudentField | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  function afterParse(headers: string[], rows: Record<string, unknown>[], label: string) {
    if (!headers.length || !rows.length) {
      setError("No rows detected. Check that the file has a header row and at least one data row.");
      return;
    }
    setError(null);
    setResult(null);
    setParsed({ headers, rows, sourceLabel: label });
    setMapping(autoMapColumns(headers));
  }

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const name = file.name.toLowerCase();
      if (name.endsWith(".csv") || name.endsWith(".tsv") || name.endsWith(".txt")) {
        const text = await file.text();
        const out = Papa.parse<Record<string, unknown>>(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });
        const headers = (out.meta.fields ?? []).filter(Boolean);
        afterParse(headers, out.data, file.name);
      } else if (
        name.endsWith(".xlsx") ||
        name.endsWith(".xls") ||
        name.endsWith(".ods")
      ) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
          raw: true,
        });
        const headers = json.length ? Object.keys(json[0]) : [];
        afterParse(headers, json, `${file.name} — ${wb.SheetNames[0]}`);
      } else {
        setError(`Unsupported file type: ${file.name}. Use .csv, .tsv, .xlsx, .xls, or .ods.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse file.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSheetUrl() {
    if (!sheetUrl) return;
    setBusy(true);
    setError(null);
    try {
      const csvUrl = googleSheetToCsvUrl(sheetUrl);
      if (!csvUrl) {
        setError("That doesn't look like a Google Sheets URL. Paste the full share link.");
        return;
      }
      const res = await fetch(csvUrl);
      if (!res.ok) {
        setError(
          `Couldn't fetch the sheet (HTTP ${res.status}). Make sure it's shared as "Anyone with the link can view".`
        );
        return;
      }
      const text = await res.text();
      const out = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      const headers = (out.meta.fields ?? []).filter(Boolean);
      afterParse(headers, out.data, "Google Sheet");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch sheet.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const { valid, errors } = mapAndNormalize(parsed.rows, mapping);
      if (valid.length === 0) {
        setError(
          `No valid rows. ${errors.length} skipped — check that First name and Last name columns are mapped.`
        );
        setBusy(false);
        return;
      }
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows: valid }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `Import failed (HTTP ${res.status})`);
        return;
      }
      setResult({
        inserted: json.inserted ?? valid.length,
        skipped: errors.length,
        errors,
      });
      setParsed(null);
      setMapping({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setParsed(null);
    setMapping({});
    setError(null);
    setResult(null);
    setSheetUrl("");
  }

  // -------- Render

  if (result) {
    return (
      <div className="space-y-6">
        <div className="border border-green-200 bg-green-50 text-green-900 p-5 rounded-sm">
          <div className="font-medium mb-1">
            Imported {result.inserted} student{result.inserted === 1 ? "" : "s"}
          </div>
          {result.skipped > 0 && (
            <p className="text-sm">
              {result.skipped} row{result.skipped === 1 ? "" : "s"} skipped for
              missing first or last name.
            </p>
          )}
        </div>
        {result.errors.length > 0 && (
          <details className="border border-rule rounded-sm p-4">
            <summary className="text-sm font-medium cursor-pointer">
              Show {result.errors.length} skipped row
              {result.errors.length === 1 ? "" : "s"}
            </summary>
            <ul className="mt-3 text-xs text-muted space-y-1">
              {result.errors.slice(0, 50).map((e) => (
                <li key={e.rowIndex}>
                  Row {e.rowIndex + 2}: {e.reason}
                </li>
              ))}
            </ul>
          </details>
        )}
        <div className="flex gap-3">
          <button onClick={reset} className="btn-primary">
            Import another file
          </button>
          <a href="/admin/students" className="btn-secondary">
            View students
          </a>
        </div>
      </div>
    );
  }

  if (!parsed) {
    return (
      <div className="space-y-8">
        {error && (
          <div className="border border-red-200 bg-red-50 text-red-800 text-sm p-4 rounded-sm">
            {error}
          </div>
        )}

        <section className="card bg-white p-6">
          <div className="eyebrow mb-3">Option 1 — Upload a file</div>
          <label className="block">
            <input
              type="file"
              accept=".csv,.tsv,.txt,.xlsx,.xls,.ods,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              disabled={busy}
              className="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-navy file:text-white hover:file:bg-teal file:cursor-pointer"
            />
          </label>
          <p className="text-xs text-subtle mt-3">
            Supported: .csv, .tsv, .xlsx, .xls, .ods
          </p>
        </section>

        <section className="card bg-white p-6">
          <div className="eyebrow mb-3">Option 2 — Paste a Google Sheet link</div>
          <div className="flex gap-2">
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/…"
              className="flex-1 border border-rule rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-teal"
            />
            <button
              onClick={handleSheetUrl}
              disabled={busy || !sheetUrl}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {busy ? "Fetching…" : "Load sheet"}
            </button>
          </div>
          <p className="text-xs text-subtle mt-3">
            The sheet must be shared as &ldquo;Anyone with the link can
            view.&rdquo; We pull the first tab as CSV.
          </p>
        </section>
      </div>
    );
  }

  // Parsed — show mapping + preview
  const { headers, rows, sourceLabel } = parsed;
  const preview = rows.slice(0, 5);
  const requiredMissing = STUDENT_FIELDS.filter(
    (f) => f.required && !Object.values(mapping).includes(f.key)
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 text-sm p-4 rounded-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          <span className="font-medium text-ink">{sourceLabel}</span> ·{" "}
          {rows.length} row{rows.length === 1 ? "" : "s"} detected
        </div>
        <button onClick={reset} className="text-xs text-muted hover:text-teal">
          Start over
        </button>
      </div>

      <section className="card bg-white p-6">
        <div className="eyebrow mb-3">Column mapping</div>
        <p className="text-sm text-muted mb-4">
          We auto-detected these mappings. Adjust any that look wrong. Leave{" "}
          <em>Ignore</em> to skip a column.
        </p>
        <div className="space-y-2">
          {headers.map((h) => (
            <div
              key={h}
              className="flex items-center gap-3 border-b border-rule py-2 last:border-0"
            >
              <div className="flex-1 text-sm font-medium text-ink">{h}</div>
              <div className="text-muted">→</div>
              <select
                value={mapping[h] ?? ""}
                onChange={(e) =>
                  setMapping({
                    ...mapping,
                    [h]: (e.target.value || null) as StudentField | null,
                  })
                }
                className="border border-rule rounded-sm px-2 py-1 text-sm bg-white min-w-[180px]"
              >
                <option value="">— Ignore —</option>
                {STUDENT_FIELDS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                    {f.required ? " *" : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {requiredMissing.length > 0 && (
          <div className="mt-4 text-sm text-red-800 bg-red-50 border border-red-200 p-3 rounded-sm">
            Still need to map: {requiredMissing.map((f) => f.label).join(", ")}
          </div>
        )}
      </section>

      <section className="card bg-white p-6">
        <div className="eyebrow mb-3">Preview (first 5 rows)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-rule">
            <thead className="bg-paper-subtle">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="text-left px-2 py-2 font-medium border-r border-rule last:border-0 whitespace-nowrap"
                  >
                    <div>{h}</div>
                    <div className="text-[10px] text-teal uppercase tracking-wider font-normal mt-0.5">
                      {mapping[h]
                        ? STUDENT_FIELDS.find((f) => f.key === mapping[h])?.label
                        : "ignore"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-t border-rule">
                  {headers.map((h) => (
                    <td
                      key={h}
                      className="px-2 py-1.5 border-r border-rule last:border-0 text-muted whitespace-nowrap"
                    >
                      {String(row[h] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={busy || requiredMissing.length > 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Importing…" : `Import ${rows.length} row${rows.length === 1 ? "" : "s"}`}
        </button>
        <button onClick={reset} className="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
