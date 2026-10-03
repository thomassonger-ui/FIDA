import type { Metadata } from "next";
import { getMemoByToken } from "@/lib/prospect-memos";
import { teamMember } from "@/lib/pipeline-team";
import { AnswerForm } from "./answer-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Memo — FIDA",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-screen bg-paper px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fida-logo.png" alt="Florida Institute of Dental Assisting" className="mx-auto h-14 w-auto" />
        </div>
        {children}
      </div>
    </main>
  );
}

export default async function MemoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const memo = await getMemoByToken(token);
  if (!memo) {
    return (
      <Shell>
        <div className="card bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-navy">This link isn&rsquo;t valid</h1>
          <p className="mt-3 text-sm text-muted">Check the link in your email, or ask whoever sent the memo for a fresh one.</p>
        </div>
      </Shell>
    );
  }
  const from = teamMember(memo.from_key)?.name ?? memo.from_key;
  const to = teamMember(memo.to_key)?.name ?? memo.to_key;
  return (
    <Shell>
      <div className="card bg-white p-6 md:p-8">
        <div className="eyebrow">Memo from {from} · to {to}{memo.due_on ? ` · due ${memo.due_on}` : ""}</div>
        <h1 className="mt-2 font-display text-2xl md:text-3xl text-navy">{memo.prospect_name}</h1>
        {memo.prospect_phone && (
          <a href={`tel:${memo.prospect_phone}`} className="mt-1 block text-sm text-teal underline tabular-nums">{memo.prospect_phone}</a>
        )}
        <pre className="mt-5 whitespace-pre-wrap font-sans text-sm text-ink leading-relaxed border border-rule rounded-md bg-paper p-4">{memo.brief}</pre>
        {memo.answered_at ? (
          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-wider text-muted">Answered</div>
            <p className="mt-1 text-sm text-ink whitespace-pre-wrap">{memo.answer}</p>
            <p className="mt-3 text-xs text-muted">This is on the card&rsquo;s notes. Nothing more to do.</p>
          </div>
        ) : (
          <AnswerForm token={token} />
        )}
      </div>
    </Shell>
  );
}
