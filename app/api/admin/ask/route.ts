// POST /api/admin/ask  { query }  — Ask Atticus over FIDA's own files. Admin-only (middleware gates /api/admin/*).
import { NextResponse } from "next/server";
import { searchFida, claudeText, auditAtticus } from "@/lib/atticus-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM = `You are Atticus, the compliance records assistant for Florida Institute of Dental Assisting (FIDA).
Answer ONLY from the numbered excerpts, which come from FIDA's own files.
- Cite every fact with its excerpt number in square brackets, e.g. [2].
- If the excerpts do not answer it, say plainly you could not find it in FIDA's files and name the document that would normally hold it. Never guess.
- Be short: 2–6 sentences or a short list, plain language for a busy school owner.`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const query = String(body.query || "").trim().slice(0, 1000);
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });
  try {
    const hits = await searchFida(query, 8);
    const sources = hits.map((h, i) => ({ n: i + 1, file_name: h.file_name, page_no: h.page_no, excerpt: h.text.replace(/\s+/g, " ").slice(0, 280) }));
    const answer = hits.length
      ? await claudeText(SYSTEM, `Question: ${query}\n\nExcerpts:\n${hits.map((h, i) => `[${i + 1}] ${h.file_name}, page ${h.page_no}\n${h.text}`).join("\n\n")}`, 700)
      : "I couldn't find anything about that in FIDA's files yet. Upload the related document under Documents and ask again.";
    await auditAtticus("ask", { query, sources: sources.length });
    return NextResponse.json({ answer, sources });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Ask Atticus failed" }, { status: 500 });
  }
}
