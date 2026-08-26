import Link from "next/link";
import { listProspects, summarize } from "@/lib/prospects-db";
import { Board } from "./board";

export const dynamic = "force-dynamic";

export const metadata = { title: "Recruiting pipeline · FIDA Admin" };

export default async function PipelinePage() {
  const prospects = await listProspects({}, 1000);
  const stats = summarize(prospects);

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
        Shared between Tom, Debbie and Ashley. Move candidates along the
        funnel, stamp a touch after every contact, and set the next follow-up —
        overdue turns red. <strong className="text-ink">Registered</strong>{" "}
        means the $150 fee is paid; promoting from Applied creates the student
        record in one click.
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

      <Board prospects={prospects} />
    </div>
  );
}
