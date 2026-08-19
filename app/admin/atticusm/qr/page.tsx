import { getServerClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "QR codes · Atticus™M · Admin",
};

type QRCode = {
  id: string;
  slug: string;
  label: string;
  channel: string | null;
  destination_path: string;
  created_at: string;
  archived_at: string | null;
};

/** Server action: create a new QR code */
async function createCode(formData: FormData) {
  "use server";

  const rawSlug = String(formData.get("slug") || "").trim();
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const label = String(formData.get("label") || "").trim();
  const channel = String(formData.get("channel") || "").trim() || null;

  // Optional custom destination. Internal paths ("/tour") and full external
  // URLs (the Google review link) are both allowed; anything else is ignored
  // and the code falls back to the default /atticus.
  const rawDest = String(formData.get("destination") || "").trim();
  const destination =
    rawDest && (/^https?:\/\//i.test(rawDest) || rawDest.startsWith("/"))
      ? rawDest.slice(0, 500)
      : null;

  if (!slug || !label) return;

  try {
    const sb = getServerClient();
    await sb.from("qr_codes").insert({
      slug,
      label,
      channel,
      ...(destination ? { destination_path: destination } : {}),
    });
  } catch (err) {
    console.error("[qr admin] create failed:", err);
  }

  revalidatePath("/admin/atticusm/qr");
}

/** Server action: archive a QR code (soft delete) */
async function archiveCode(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    const sb = getServerClient();
    await sb.from("qr_codes").update({ archived_at: new Date().toISOString() }).eq("id", id);
  } catch (err) {
    console.error("[qr admin] archive failed:", err);
  }
  revalidatePath("/admin/atticusm/qr");
}

async function getCodes(): Promise<{ active: QRCode[]; archived: QRCode[] }> {
  try {
    const sb = getServerClient();
    const { data } = await sb
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false });
    const all = (data ?? []) as QRCode[];
    return {
      active: all.filter((c) => !c.archived_at),
      archived: all.filter((c) => c.archived_at),
    };
  } catch {
    return { active: [], archived: [] };
  }
}

/** Returns scan counts per slug for the current cycle */
async function getScanCounts(cycleStart: Date): Promise<Record<string, number>> {
  try {
    const sb = getServerClient();
    const { data } = await sb
      .from("qr_scans")
      .select("slug")
      .gte("scanned_at", cycleStart.toISOString());
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const s = (row as { slug: string }).slug;
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

function getCycleStart(): Date {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  if (d >= 15) return new Date(y, m, 15);
  return new Date(y, m - 1, 15);
}

function buildQRImageUrl(slug: string): string {
  // Brand domain — was fida-eight.vercel.app before the 2026-08-18 domain
  // merge, which would have printed QR codes pointing at the wrong host.
  const target = `https://fldentalassisting.com/qr/${slug}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(
    target
  )}`;
}

export default async function QRAdminPage() {
  const { active, archived } = await getCodes();
  const cycleStart = getCycleStart();
  const counts = await getScanCounts(cycleStart);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Link href="/admin/atticusm" className="eyebrow text-teal-deep hover:text-teal">
          &larr; Atticus™M
        </Link>
        <span className="text-xs text-subtle">· QR codes</span>
      </div>
      <h1 className="font-display text-4xl text-ink tracking-tight">QR codes</h1>
      <p className="text-sm text-muted mt-1 max-w-2xl">
        Mint a new code, copy the PNG, print and post it. Every scan logs source-attributed
        data so the dashboard knows which flyer / sign / table is driving leads.
      </p>

      {/* MINT FORM */}
      <form
        action={createCode}
        className="mt-6 border border-rule rounded-sm p-5 bg-paper grid md:grid-cols-12 gap-3"
      >
        <div className="md:col-span-3">
          <label className="eyebrow text-muted">Slug</label>
          <input
            name="slug"
            placeholder="riverside-arts-jun"
            required
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm font-mono"
          />
          <p className="text-[10px] text-subtle mt-1">Lowercase, hyphens only.</p>
        </div>
        <div className="md:col-span-4">
          <label className="eyebrow text-muted">Label</label>
          <input
            name="label"
            placeholder="Riverside Arts Market — Jun 6"
            required
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-3">
          <label className="eyebrow text-muted">Channel</label>
          <select
            name="channel"
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
          >
            <option value="">—</option>
            <option value="Print">Print</option>
            <option value="Field">Field</option>
            <option value="Event">Event</option>
            <option value="Social">Social</option>
            <option value="Referral">Referral</option>
          </select>
        </div>
        <div className="md:col-span-2 flex items-end">
          <button
            type="submit"
            className="w-full bg-teal text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal-deep transition"
          >
            Mint code
          </button>
        </div>
        <div className="md:col-span-12">
          <label className="eyebrow text-muted">
            Destination (optional — defaults to /atticus)
          </label>
          <input
            name="destination"
            placeholder="https://g.page/r/…/review or /tour"
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm font-mono"
          />
          <p className="text-[10px] text-subtle mt-1">
            Where scanners land. Internal paths get ?src= attribution; external
            URLs (like the Google review link) redirect clean — the scan is
            still logged either way.
          </p>
        </div>
      </form>

      {/* ACTIVE CODES */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-ink">Active codes ({active.length})</h2>
          <div className="text-xs text-subtle">
            Cycle scans since {cycleStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>

        {active.length === 0 ? (
          <div className="border border-dashed border-rule rounded-sm p-8 text-center text-sm text-muted">
            No active codes yet. Mint one above to start tracking scans.
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((c) => (
              <div
                key={c.id}
                className="border border-rule bg-paper rounded-sm p-4 flex items-center gap-5 flex-wrap"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={buildQRImageUrl(c.slug)}
                  alt={`QR for ${c.slug}`}
                  className="w-20 h-20 border border-rule rounded-sm bg-white"
                />
                <div className="flex-1 min-w-[200px]">
                  <div className="font-display text-lg text-ink leading-tight">{c.label}</div>
                  <div className="text-xs text-muted mt-1 font-mono">/qr/{c.slug}</div>
                  {c.channel && (
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-eyebrow font-semibold px-2 py-0.5 rounded-sm bg-paper-subtle text-muted border border-rule">
                      {c.channel}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-ink">{counts[c.slug] || 0}</div>
                  <div className="eyebrow text-muted">cycle scans</div>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <a
                    href={buildQRImageUrl(c.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal hover:text-teal-deep underline"
                  >
                    Open PNG
                  </a>
                  <form action={archiveCode}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-subtle hover:text-ink underline">
                      Archive
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ARCHIVED CODES */}
      {archived.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-muted">Archived ({archived.length})</h2>
          <div className="mt-3 space-y-2">
            {archived.map((c) => (
              <div
                key={c.id}
                className="border border-rule bg-paper-subtle rounded-sm p-3 text-sm text-muted flex items-center justify-between"
              >
                <div>
                  <span className="font-mono">/qr/{c.slug}</span> — {c.label}
                </div>
                <div className="text-xs">{counts[c.slug] || 0} scans this cycle</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-subtle mt-10 italic">
        QR images are rendered by api.qrserver.com (free, no auth, no rate limit). If you want
        them generated locally, install <code className="font-mono">qrcode</code> and we can swap.
      </p>
    </div>
  );
}
