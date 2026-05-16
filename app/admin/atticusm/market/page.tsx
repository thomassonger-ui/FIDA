import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase";
import { MetricEditForm } from "./metric-edit-form";
import { Interpretation } from "./interpretation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Market analysis · Atticus™M · Admin",
};

// ---------- TYPES ----------
export type MetricRow = {
  id: string;
  category:
    | "labor_demand"
    | "workforce_supply"
    | "addressable_market"
    | "education_landscape"
    | "demographics";
  metric_key: string;
  label: string;
  value: number | null;
  unit: string | null;
  display_format: "number" | "currency" | "percent" | "count";
  source_name: string | null;
  source_url: string | null;
  as_of_date: string | null;
  notes: string | null;
  needs_review: boolean;
  display_order: number;
};

const CATEGORY_LABEL: Record<MetricRow["category"], string> = {
  labor_demand: "Labor demand",
  workforce_supply: "Workforce supply",
  addressable_market: "Addressable market",
  education_landscape: "Education landscape",
  demographics: "Demographics",
};

const CATEGORY_ORDER: MetricRow["category"][] = [
  "labor_demand",
  "workforce_supply",
  "addressable_market",
  "education_landscape",
  "demographics",
];

// ---------- SERVER ACTIONS ----------

async function updateMetric(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;

  const rawValue = String(formData.get("value") || "").trim();
  const value = rawValue === "" ? null : Number(rawValue);
  const unit = String(formData.get("unit") || "") || null;
  const source_name = String(formData.get("source_name") || "") || null;
  const source_url = String(formData.get("source_url") || "") || null;
  const as_of_date = String(formData.get("as_of_date") || "") || null;
  const notes = String(formData.get("notes") || "") || null;
  const needs_review = formData.get("needs_review") === "1";

  try {
    const sb = getServerClient();
    await sb
      .from("market_signals")
      .update({
        value,
        unit,
        source_name,
        source_url,
        as_of_date,
        notes,
        needs_review,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (err) {
    console.error("[market] update failed:", err);
  }
  revalidatePath("/admin/atticusm/market");
}

// ---------- DATA ----------

async function getMetrics(): Promise<Record<MetricRow["category"], MetricRow[]>> {
  const empty = CATEGORY_ORDER.reduce(
    (acc, c) => ({ ...acc, [c]: [] }),
    {} as Record<MetricRow["category"], MetricRow[]>
  );
  try {
    const sb = getServerClient();
    const { data } = await sb
      .from("market_signals")
      .select("*")
      .order("category", { ascending: true })
      .order("display_order", { ascending: true });
    const rows = (data ?? []) as MetricRow[];
    const grouped = { ...empty };
    for (const r of rows) {
      grouped[r.category] = [...(grouped[r.category] || []), r];
    }
    return grouped;
  } catch (err) {
    console.error("[market] load failed:", err);
    return empty;
  }
}

// ---------- FORMATTERS ----------

function formatValue(m: MetricRow): string {
  if (m.value == null) return "—";
  const n = Number(m.value);
  switch (m.display_format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: n >= 1000 ? 0 : 2,
      }).format(n);
    case "percent":
      return `${n.toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
    case "count":
    case "number":
    default:
      return n.toLocaleString("en-US", { maximumFractionDigits: n >= 100 ? 0 : 2 });
  }
}

function formatAsOf(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

// ---------- COMPONENTS ----------

function MetricCard({ m }: { m: MetricRow }) {
  return (
    <details className="group border border-rule rounded-sm bg-paper p-4">
      <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-display text-2xl text-ink leading-none">
            {formatValue(m)}
            {m.unit && m.display_format !== "currency" && m.display_format !== "percent" && (
              <span className="text-sm text-muted ml-1">{m.unit}</span>
            )}
          </div>
          <div className="text-sm text-ink mt-1 leading-snug">{m.label}</div>
          <div className="text-[11px] text-subtle mt-2">
            {m.source_url ? (
              <a
                href={m.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-deep underline decoration-dotted"
              >
                {m.source_name || "Source"}
              </a>
            ) : (
              <span>{m.source_name || "No source"}</span>
            )}
            <span> · as of {formatAsOf(m.as_of_date)}</span>
            {m.needs_review && (
              <span className="ml-2 inline-block bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider">
                Needs review
              </span>
            )}
          </div>
          {m.notes && (
            <div className="text-xs text-muted mt-2 italic leading-snug">{m.notes}</div>
          )}
        </div>
        <div className="text-xs text-teal-deep group-open:hidden">Edit</div>
        <div className="text-xs text-subtle hidden group-open:block">Close</div>
      </summary>
      <div className="mt-4 pt-4 border-t border-rule">
        <MetricEditForm metric={m} action={updateMetric} />
      </div>
    </details>
  );
}

// ---------- PAGE ----------

export default async function MarketAnalysisPage() {
  const grouped = await getMetrics();
  const allMetrics = CATEGORY_ORDER.flatMap((c) => grouped[c]);
  const populatedCount = allMetrics.filter((m) => m.value != null).length;
  const reviewCount = allMetrics.filter((m) => m.needs_review).length;

  return (
    <div className="max-w-6xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Link href="/admin/atticusm" className="eyebrow text-teal-deep hover:text-teal">
          &larr; Atticus™M
        </Link>
        <span className="text-xs text-subtle">· Market analysis</span>
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl text-ink tracking-tight">Market analysis</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl leading-snug">
            Jacksonville-area dental labor + demographic signals. Every metric carries its
            source, citation date, and a needs-review flag for figures that were estimated
            or inferred. Use for marketing decisions, copy fuel, and investor reporting.
          </p>
        </div>
        <div className="text-xs text-subtle text-right">
          <div>
            <span className="font-display text-base text-ink">{populatedCount}</span> /{" "}
            {allMetrics.length} populated
          </div>
          {reviewCount > 0 && (
            <div className="text-amber-700 mt-1">{reviewCount} need review</div>
          )}
        </div>
      </div>

      {/* AI INTERPRETATION */}
      <section className="mt-8">
        <Interpretation />
      </section>

      {/* CATEGORY SECTIONS */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat];
        if (!items?.length) return null;
        return (
          <section key={cat} className="mt-10">
            <h2 className="font-display text-xl text-ink mb-3">{CATEGORY_LABEL[cat]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((m) => (
                <MetricCard key={m.id} m={m} />
              ))}
            </div>
          </section>
        );
      })}

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-rule text-xs text-subtle">
        Tip: click any metric card to edit the value, source, or as-of date. When you
        update a number, the AI interpretation above will recompute on its next
        regeneration.
      </div>
    </div>
  );
}
