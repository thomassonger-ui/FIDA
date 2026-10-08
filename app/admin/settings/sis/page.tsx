import { getServerClient } from "@/lib/supabase";
import { loadFieldDefs, viewerRole } from "@/lib/sis";
import SisFieldManager from "@/components/sis/SisFieldManager";

export const dynamic = "force-dynamic";

async function programNames(): Promise<string[]> {
  try {
    const { data } = await getServerClient().from("students").select("program").not("program", "is", null);
    return Array.from(new Set((data ?? []).map((r) => r.program as string).filter(Boolean))).sort();
  } catch {
    return [];
  }
}

export default async function SisSettingsPage() {
  const [defs, { role }, programs] = await Promise.all([loadFieldDefs(true), viewerRole(), programNames()]);

  return (
    <div>
      <div className="eyebrow mb-3">Settings</div>
      <h1 className="text-3xl md:text-4xl mb-2">SIS fields</h1>
      <p className="text-sm text-muted max-w-3xl mb-2">
        What the student record holds, who can see it, and what students can update themselves.
        Core fields are part of every Atticus school; program fields are FIDA&rsquo;s own &mdash; add one for any
        program-specific requirement (radiography certificate, immunizations, kit size) without a code change.
      </p>
      <p className="text-xs text-subtle max-w-3xl mb-8">
        Atticus never stores Social Security numbers. Every change here is written to the audit trail.
      </p>
      {defs.length === 0 ? (
        <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-3 py-2 max-w-2xl text-sm text-amber-950">
          Not set up yet. Run <code className="font-mono text-xs">supabase/migrations/20261008_sis.sql</code> in the
          Supabase SQL editor, then reload this page.
        </div>
      ) : (
        <SisFieldManager defs={defs} programs={programs} canEdit={role === "owner"} />
      )}
    </div>
  );
}
