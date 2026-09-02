import Link from "next/link";
import { countProspects, listProspects, pipelineStats } from "@/lib/prospects-db";
import { Board } from "./board";

export const dynamic = "force-dynamic";

export const metadata = { title: "Recruiting pipeline · FIDA Admin" };

export default async function PipelinePage() {
  // The board is for people being worked. The identified pool (the whole
  // imported list) stays in Prospects — it would be thousands of cards here.
  const [prospects, stats, identifiedEmployers] = await Promise.all([
    listProspects({ excludeIdentified: true }, 1000),
    pipelineStats(),
    countProspects({ stage: "identified", segment: "dentist_employer" }),
  ]);
  const identified = {
    employer: identifiedEmployers,
    student: Math.max(0, stats.identified - identifiedEmployers),
  };

  return (
    <div>
      <div className="eyebrow">Recruiting · Pipeline</div>
      <div className="flex items-center justify-between mt-2 flex-wrap gap-3">
        <h1 className="font-display text-4xl md:text-5xl">
          Recruiting pipeline
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/prospects" className="btn-outline">
            Prospects
          </Link>
          <Link href="/admin/prospects/import" className="btn-outline">
            Import CSV
          </Link>
          <a
            href="/api/admin/prospects/export"
            className="btn-outline"
            download
          >
            Export CSV
          </a>
        </div>
      </div>

      <p className="mt-3 text-muted max-w-2xl text-sm">
        Shared between Tom, Debbie and Ashley. Two funnels: <strong className="text-ink">Dentists</strong>{" "}
        (practice owners buying Radiography/EFDA for their assistants — New →
        In outreach → Interested → Staff enrolled) and{" "}
        <strong className="text-ink">Students</strong> (Identified → Nurture →
        Applied → Registered → Enrolled → Graduated, where Registered means the
        $150 fee is paid and promotes them into Students).
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="card p-5">
          <div className="eyebrow text-muted">In pipeline</div>
          <div className="font-display text-4xl tabular-nums mt-2">
            {stats.inPipeline}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-muted">Follow-ups overdue</div>
          <div className="font-display text-4xl tabular-nums mt-2 text-teal">
            {stats.overdue}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-muted">No touch in 7d</div>
          <div className="font-display text-4xl tabular-nums mt-2 text-teal">
            {stats.stale7d}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow text-muted">Registered</div>
          <div className="font-display text-4xl tabular-nums mt-2 text-teal">
            {stats.registered}
          </div>
        </div>
      </div>

      <Board prospects={prospects} identified={identified} />
    </div>
  );
}
