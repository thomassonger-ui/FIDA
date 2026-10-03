import Link from "next/link";
import { countProspects, listProspects, pipelineStats } from "@/lib/prospects-db";
import { listOpenMemos } from "@/lib/prospect-memos";
import { teamMember } from "@/lib/pipeline-team";
import { Board } from "./board";

function etToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

export const dynamic = "force-dynamic";

export const metadata = { title: "Recruiting pipeline · FIDA Admin" };

export default async function PipelinePage() {
  // The board is for people being worked. The identified pool (the whole
  // imported list) stays in Prospects — it would be thousands of cards here.
  const [prospects, stats, identifiedEmployers, openMemos] = await Promise.all([
    listProspects({ excludeIdentified: true }, 1000),
    pipelineStats(),
    countProspects({ stage: "identified", segment: "dentist_employer" }),
    listOpenMemos(),
  ]);
  const today = etToday();
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
        In outreach → Interested → Meeting Set → Proposal → Closed Won) and{" "}
        <strong className="text-ink">Students</strong> (Identified → Nurture →
        Applied → Meeting Set → Proposal → Closed Won → Enrolled → Graduated, where Closed Won means the
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
          <div className="eyebrow text-muted">Closed Won</div>
          <div className="font-display text-4xl tabular-nums mt-2 text-teal">
            {stats.registered}
          </div>
        </div>
      </div>

      {openMemos.length > 0 && (
        <div className="card mt-8 p-5">
          <div className="eyebrow text-muted">
            Open memos · {openMemos.length} waiting
          </div>
          <ul className="mt-3 divide-y divide-rule">
            {openMemos.map((m) => {
              const overdue = Boolean(m.due_on && m.due_on < today);
              return (
                <li key={m.id} className="py-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      overdue ? "bg-red-50 text-red-700" : "bg-violet-50 text-violet-800"
                    }`}
                  >
                    {overdue ? "overdue" : "open"}
                  </span>
                  <span className="font-medium text-navy">{m.prospect_name}</span>
                  <span className="text-muted">
                    {teamMember(m.from_key)?.name.split(" ")[0] ?? m.from_key} → {teamMember(m.to_key)?.name ?? m.to_key}
                  </span>
                  <span className="text-muted truncate max-w-md">{m.goal}</span>
                  {m.due_on && <span className="text-xs text-muted tabular-nums">due {m.due_on}</span>}
                  <a href={`/memo/${m.token}`} className="ml-auto text-xs font-semibold text-teal underline">
                    Answer
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Board prospects={prospects} identified={identified} openMemos={openMemos} />
    </div>
  );
}
