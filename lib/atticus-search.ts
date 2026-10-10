// Server-only: Ask Atticus / Audit Binder search over FIDA's own files (compliance vault +
// student files) via the atticus-doc-read edge function in FIDA's Supabase project.
import Anthropic from "@anthropic-ai/sdk";
import { getServerClient } from "@/lib/supabase";

export interface SearchHit {
  chunk_id: string;
  source_table: "document_records" | "student_documents";
  document_id: string;
  student_id: string | null;
  page_no: number;
  text: string;
  score: number;
  file_name: string;
}

let cachedKey: string | null = null;
async function docReadKey(): Promise<string> {
  if (cachedKey) return cachedKey;
  const { data } = await getServerClient().from("atticus_config").select("value").eq("key", "doc_read_key").maybeSingle();
  if (!data?.value) throw new Error("Document search is not configured");
  cachedKey = data.value as string;
  return cachedKey;
}

async function searchOnce(query: string, k: number, studentId?: string | null): Promise<Omit<SearchHit, "file_name">[]> {
  const url = `${process.env.SUPABASE_URL}/functions/v1/atticus-doc-read`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-atticus-key": await docReadKey() },
    body: JSON.stringify({ action: "search", query, k, student_id: studentId ?? null }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Search failed (${res.status})`);
  return body.results ?? [];
}

/** Search FIDA's files. Pass studentIds to limit to one student's files (uuid and/or student number). */
export async function searchFida(query: string, k = 10, studentIds: string[] = []): Promise<SearchHit[]> {
  const runs = studentIds.length ? await Promise.all(studentIds.map((s) => searchOnce(query, k, s))) : [await searchOnce(query, k)];
  const seen = new Set<string>();
  const rows = runs.flat().sort((a, b) => b.score - a.score).filter((r) => !seen.has(r.chunk_id) && seen.add(r.chunk_id)).slice(0, k);
  if (!rows.length) return [];
  const sb = getServerClient();
  const ids = (t: string) => [...new Set(rows.filter((r) => r.source_table === t).map((r) => Number(r.document_id)))];
  const [vault, student] = await Promise.all([
    ids("document_records").length ? sb.from("document_records").select("id, filename").in("id", ids("document_records")) : Promise.resolve({ data: [] }),
    ids("student_documents").length ? sb.from("student_documents").select("id, filename, label").in("id", ids("student_documents")) : Promise.resolve({ data: [] }),
  ]);
  const names = new Map<string, string>();
  for (const d of (vault.data ?? []) as { id: number; filename: string }[]) names.set(`document_records:${d.id}`, d.filename);
  for (const d of (student.data ?? []) as { id: number; filename: string; label: string | null }[])
    names.set(`student_documents:${d.id}`, d.label ? `${d.label} (${d.filename})` : d.filename);
  return rows.map((r) => ({ ...r, file_name: names.get(`${r.source_table}:${r.document_id}`) ?? "document" }));
}

// ---- Claude helpers
const MODEL = process.env.ATTICUS_MODEL || "claude-sonnet-4-6";
let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Atticus is offline — missing ANTHROPIC_API_KEY.");
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}
export async function claudeText(system: string, user: string, maxTokens = 1200): Promise<string> {
  const res = await client().messages.create({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] });
  return res.content.filter((c) => c.type === "text").map((c) => (c as { text: string }).text).join("").trim();
}
export async function claudeJson<T>(system: string, user: string, maxTokens = 1500): Promise<T> {
  const raw = await claudeText(system + "\nReply with JSON only, no prose, no code fences.", user, maxTokens);
  const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
  if (s < 0 || e < s) throw new Error("Atticus could not structure a reply. Please try again.");
  return JSON.parse(raw.slice(s, e + 1)) as T;
}

/** Best-effort audit row in FIDA's audit_events. */
export async function auditAtticus(action: string, detail: Record<string, unknown>) {
  try {
    await getServerClient().from("audit_events").insert([{ entity_type: "atticus", action, new_value: detail, actor: "admin" }]);
  } catch { /* never block the request */ }
}
