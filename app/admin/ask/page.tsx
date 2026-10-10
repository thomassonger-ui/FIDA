import { AskAtticus } from "@/components/admin/AskAtticus";

export const dynamic = "force-dynamic";

export default async function AskAtticusPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; binder?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-3">Atticus</div>
        <h1 className="text-3xl md:text-4xl mb-2">Ask Atticus</h1>
        <p className="text-muted max-w-prose">
          Ask a question about FIDA&apos;s records, or build an audit binder for an inspector, attorney or
          consultant &mdash; for the whole school or one student. Atticus only searches FIDA&apos;s own files
          and cites the file and page for everything it finds.
        </p>
      </div>
      <AskAtticus initialQ={sp.q} initialBinder={sp.binder === "1"} />
    </div>
  );
}
