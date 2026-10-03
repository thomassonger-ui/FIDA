/**
 * Memos on pipeline cards — "please call this office and find out X".
 * Sent from the board, answered by private link, answer lands on the card.
 */
import { randomBytes } from "crypto";
import { getServerClient } from "@/lib/supabase";
import { getProspect, logTouch, updateProspect } from "@/lib/prospects-db";
import { displayName } from "@/lib/prospects-shared";
import { teamMember } from "@/lib/pipeline-team";
import { sendMail } from "@/lib/mail";
import { siteOrigin } from "@/lib/site-url";

export type Memo = {
  id: string;
  prospect_id: string;
  token: string;
  from_key: string;
  to_key: string;
  goal: string;
  brief: string;
  due_on: string | null;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
};

export type MemoRow = Memo & { prospect_name: string };

function etDay(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(d);
}

function stamp(): string {
  const [y, m, d] = etDay().split("-");
  return `${Number(m)}/${Number(d)}/${y.slice(2)}`;
}

export async function createMemo(input: {
  prospectId: string; fromKey: string; toKey: string; goal: string; brief: string; dueOn: string | null;
}): Promise<{ memo: Memo; emailed: boolean; emailError?: string } | { error: string }> {
  const to = teamMember(input.toKey);
  const from = teamMember(input.fromKey);
  if (!to || !from) return { error: "Unknown team member." };
  const p = await getProspect(input.prospectId);
  if (!p) return { error: "Prospect not found." };
  const goal = input.goal.trim();
  if (!goal) return { error: "Say what they want / the goal of the call." };
  const brief = input.brief.trim().replace("WHAT THEY WANT\n—", `WHAT THEY WANT\n${goal}`);
  const token = randomBytes(24).toString("base64url");
  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("prospect_memos")
    .insert({ prospect_id: p.id, token, from_key: from.key, to_key: to.key, goal, brief, due_on: input.dueOn })
    .select("*")
    .single();
  if (error) return { error: error.message };
  const memo = data as Memo;
  const who = displayName(p);
  await logTouch(p.id, { kind: "note", outcome: "memo sent", body: `Memo to ${to.name}: ${goal}`, actor: from.key });
  const link = `${siteOrigin()}/memo/${token}`;
  const r = await sendMail({
    to: to.email,
    subject: `Memo from ${from.name.split(" ")[0]}: ${who}${p.current_employer ? ` — ${p.current_employer}` : ""}`,
    text: [
      brief,
      "",
      "—",
      `Answer this memo (private link): ${link}`,
      memo.due_on ? `Due ${memo.due_on}.` : "",
    ].filter(Boolean).join("\n"),
  });
  return { memo, emailed: r.ok, emailError: r.ok ? undefined : r.error };
}

export async function getMemoByToken(token: string): Promise<(Memo & { prospect_name: string; prospect_phone: string | null }) | null> {
  if (!token || token.length > 80) return null;
  const supabase = getServerClient();
  const { data } = await supabase.from("prospect_memos").select("*").eq("token", token).maybeSingle();
  if (!data) return null;
  const p = await getProspect((data as Memo).prospect_id);
  return { ...(data as Memo), prospect_name: p ? displayName(p) : "—", prospect_phone: p?.phone ?? null };
}

/** The recipient's answer: saved on the memo, stamped onto the card's notes, logged as a touch. */
export async function answerMemo(token: string, answer: string): Promise<{ ok: true } | { error: string }> {
  const a = answer.trim().slice(0, 4000);
  if (!a) return { error: "Write what happened first." };
  const memo = await getMemoByToken(token);
  if (!memo) return { error: "This memo link is not valid." };
  if (memo.answered_at) return { error: "This memo was already answered." };
  const to = teamMember(memo.to_key);
  const supabase = getServerClient();
  const { error } = await supabase
    .from("prospect_memos")
    .update({ answer: a, answered_at: new Date().toISOString() })
    .eq("id", memo.id);
  if (error) return { error: error.message };
  const p = await getProspect(memo.prospect_id);
  const line = `${stamp()} memo answer (${to?.name.split(" ")[0] ?? memo.to_key}) — ${a}`;
  const prev = p?.notes?.trim();
  await updateProspect(memo.prospect_id, { notes: prev ? `${line}\n${prev}` : line });
  await logTouch(memo.prospect_id, { kind: "note", outcome: "memo answered", body: a, actor: memo.to_key });
  // Tell the sender.
  const from = teamMember(memo.from_key);
  if (from)
    await sendMail({
      to: from.email,
      subject: `Memo answered: ${memo.prospect_name} — ${to?.name ?? memo.to_key}`,
      text: [`${to?.name ?? memo.to_key} answered your memo on ${memo.prospect_name}:`, "", a, "", `Card: ${siteOrigin()}/admin/prospects/pipeline`].join("\n"),
    });
  return { ok: true };
}

/** Open memos (not yet answered), oldest due first, with the prospect's name. For the board's "My Memos" panel. */
export async function listOpenMemos(): Promise<MemoRow[]> {
  try {
    const supabase = getServerClient();
    const { data } = await supabase
      .from("prospect_memos")
      .select("*, prospects!inner(full_name, first_name, last_name, email)")
      .is("answered_at", null)
      .order("due_on", { ascending: true, nullsFirst: false })
      .limit(100);
    return ((data ?? []) as (Memo & { prospects: { full_name: string | null; first_name: string | null; last_name: string | null; email: string | null } })[]).map(
      ({ prospects, ...m }) => ({ ...m, prospect_name: displayName(prospects) })
    );
  } catch {
    return [];
  }
}
