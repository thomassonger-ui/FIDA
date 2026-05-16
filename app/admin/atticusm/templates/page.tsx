import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase";
import { GenerateForm } from "./generate-form";
import { TemplateCard } from "./template-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Campaign Templates · Atticus™M · Admin",
};

// ---------- TYPES ----------
export type TemplateRow = {
  id: string;
  channel: "social" | "reel" | "email" | "sms" | "yard_sign";
  program: "rdp_ce" | "efda" | "both";
  goal: string;
  audience: string | null;
  subject: string | null;
  preview_text: string | null;
  body: string;
  char_count: number;
  starred: boolean;
  archived_at: string | null;
  created_at: string;
};

// ---------- SERVER ACTIONS ----------

/** Save a generated variation to the library. */
async function saveTemplate(formData: FormData) {
  "use server";
  const channel = String(formData.get("channel") || "");
  const program = String(formData.get("program") || "");
  const goal = String(formData.get("goal") || "");
  const audience = String(formData.get("audience") || "") || null;
  const subject = String(formData.get("subject") || "") || null;
  const previewText = String(formData.get("preview_text") || "") || null;
  const body = String(formData.get("body") || "");
  const promptHash = String(formData.get("prompt_hash") || "") || null;

  if (!channel || !program || !goal || !body) return;

  try {
    const sb = getServerClient();
    await sb.from("campaign_templates").insert({
      channel,
      program,
      goal,
      audience,
      subject,
      preview_text: previewText,
      body,
      char_count: body.length,
      source_prompt_hash: promptHash,
    });
  } catch (err) {
    console.error("[campaign templates] save failed:", err);
  }
  revalidatePath("/admin/atticusm/templates");
}

/** Toggle starred on an existing template. */
async function toggleStar(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const next = formData.get("next") === "1";
  if (!id) return;
  try {
    const sb = getServerClient();
    await sb.from("campaign_templates").update({ starred: next }).eq("id", id);
  } catch (err) {
    console.error("[campaign templates] star failed:", err);
  }
  revalidatePath("/admin/atticusm/templates");
}

/** Soft-archive a template. */
async function archiveTemplate(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    const sb = getServerClient();
    await sb
      .from("campaign_templates")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
  } catch (err) {
    console.error("[campaign templates] archive failed:", err);
  }
  revalidatePath("/admin/atticusm/templates");
}

// ---------- DATA ----------

async function getLibrary(): Promise<{
  starred: TemplateRow[];
  recent: TemplateRow[];
}> {
  try {
    const sb = getServerClient();
    const { data } = await sb
      .from("campaign_templates")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(100);
    const rows = (data ?? []) as TemplateRow[];
    return {
      starred: rows.filter((r) => r.starred),
      recent: rows.filter((r) => !r.starred),
    };
  } catch {
    return { starred: [], recent: [] };
  }
}

// ---------- PAGE ----------

export default async function CampaignTemplatesPage() {
  const { starred, recent } = await getLibrary();

  return (
    <div className="max-w-6xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Link href="/admin/atticusm" className="eyebrow text-teal-deep hover:text-teal">
          &larr; Atticus™M
        </Link>
        <span className="text-xs text-subtle">· Campaign templates</span>
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl text-ink tracking-tight">Campaign templates</h1>
          <p className="text-sm text-muted mt-2 max-w-2xl leading-snug">
            AI-generated social, email, and SMS copy tuned to FIDA&rsquo;s voice and programs.
            Pick a channel and a goal, get three variations, ship the one that fits — or save
            it to the library for next cycle.
          </p>
        </div>
      </div>

      {/* GENERATE PANEL */}
      <section className="mt-8">
        <GenerateForm saveAction={saveTemplate} />
      </section>

      {/* STARRED LIBRARY */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-ink">
            <span className="text-amber-500 mr-1">★</span>
            Starred ({starred.length})
          </h2>
          <span className="text-xs text-subtle">Your go-to copy — pin the best 5–10.</span>
        </div>
        {starred.length === 0 ? (
          <div className="border border-dashed border-rule rounded-sm p-6 text-sm text-muted">
            No starred templates yet. Star a saved variation to pin it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {starred.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                toggleStar={toggleStar}
                archive={archiveTemplate}
              />
            ))}
          </div>
        )}
      </section>

      {/* RECENT LIBRARY */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-ink">Saved library ({recent.length})</h2>
          <span className="text-xs text-subtle">All saved variations, newest first.</span>
        </div>
        {recent.length === 0 ? (
          <div className="border border-dashed border-rule rounded-sm p-6 text-sm text-muted">
            Saved variations show up here. Generate above, then hit &ldquo;Save&rdquo; on the ones worth keeping.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                toggleStar={toggleStar}
                archive={archiveTemplate}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
