"use client";

import { useTransition } from "react";
import type { MetricRow } from "./page";

export function MetricEditForm({
  metric,
  action,
}: {
  metric: MetricRow;
  action: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(() => {
      void action(formData);
    });
  }

  return (
    <form action={onSubmit} className="grid md:grid-cols-12 gap-3 text-sm">
      <input type="hidden" name="id" value={metric.id} />

      <div className="md:col-span-3">
        <label className="eyebrow text-muted">Value</label>
        <input
          name="value"
          type="number"
          step="any"
          defaultValue={metric.value ?? ""}
          placeholder="(empty)"
          className="mt-1 w-full border border-rule rounded-sm px-2 py-1.5 font-mono text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <label className="eyebrow text-muted">Unit</label>
        <input
          name="unit"
          defaultValue={metric.unit ?? ""}
          placeholder="e.g. $, %, jobs"
          className="mt-1 w-full border border-rule rounded-sm px-2 py-1.5 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <label className="eyebrow text-muted">As-of date</label>
        <input
          name="as_of_date"
          type="date"
          defaultValue={metric.as_of_date ?? ""}
          className="mt-1 w-full border border-rule rounded-sm px-2 py-1.5 text-sm"
        />
      </div>

      <div className="md:col-span-5 flex items-end gap-2">
        <label className="flex items-center gap-2 text-xs text-ink">
          <input
            type="checkbox"
            name="needs_review"
            value="1"
            defaultChecked={metric.needs_review}
            className="rounded-sm"
          />
          Needs review
        </label>
      </div>

      <div className="md:col-span-6">
        <label className="eyebrow text-muted">Source name</label>
        <input
          name="source_name"
          defaultValue={metric.source_name ?? ""}
          placeholder="e.g. BLS OEWS May 2024"
          className="mt-1 w-full border border-rule rounded-sm px-2 py-1.5 text-sm"
        />
      </div>

      <div className="md:col-span-6">
        <label className="eyebrow text-muted">Source URL</label>
        <input
          name="source_url"
          defaultValue={metric.source_url ?? ""}
          placeholder="https://…"
          className="mt-1 w-full border border-rule rounded-sm px-2 py-1.5 text-sm font-mono"
        />
      </div>

      <div className="md:col-span-12">
        <label className="eyebrow text-muted">Notes</label>
        <textarea
          name="notes"
          defaultValue={metric.notes ?? ""}
          rows={2}
          placeholder="Methodology, caveats, what to verify next…"
          className="mt-1 w-full border border-rule rounded-sm px-2 py-1.5 text-sm"
        />
      </div>

      <div className="md:col-span-12 flex items-center justify-between gap-2">
        <span className="text-[11px] text-subtle font-mono">{metric.metric_key}</span>
        <button
          type="submit"
          disabled={isPending}
          className="bg-teal text-white text-xs font-semibold px-3 py-1.5 rounded-sm hover:bg-teal-deep transition disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save metric"}
        </button>
      </div>
    </form>
  );
}
