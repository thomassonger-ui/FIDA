import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase";
import { demoLeads, demoTranscript, isDemoLeadId } from "@/lib/demo-leads";

export const dynamic = "force-dynamic";

type Session = {
  id: string;
  created_at: string;
  last_activity_at: string | null;
  handed_off_at: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  program_interest: string | null;
  lead_timeline: string | null;
  message_count: number | null;
  flagged_count: number | null;
  user_agent: string | null;
};

type Msg = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  flagged: boolean;
  flag_reason: string | null;
};

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/** Build a Session + Msg[] for a demo lead so the detail page doesn't 404. */
function loadDemoSession(id: string): { session: Session; messages: Msg[]; isDemo: true } | null {
  const lead = demoLeads().find((l) => l.id === id);
  if (!lead) return null;
  const transcript = demoTranscript(lead);
  return {
    session: {
      id: lead.id,
      created_at: lead.created_at,
      last_activity_at: lead.last_activity_at,
      handed_off_at: lead.handed_off_at,
      lead_name: lead.lead_name,
      lead_email: lead.lead_email,
      lead_phone: lead.lead_phone,
      program_interest: lead.program_interest,
      lead_timeline: lead.lead_timeline,
      message_count: lead.message_count,
      flagged_count: lead.flagged_count,
      user_agent: null,
    },
    messages: transcript.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at,
      flagged: m.flagged,
      flag_reason: m.flag_reason,
    })),
    isDemo: true,
  };
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminLeadTranscriptPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  let session: Session | null = null;
  let messages: Msg[] = [];
  let isDemo = false;

  if (isDemoLeadId(sessionId)) {
    const demo = loadDemoSession(sessionId);
    if (!demo) notFound();
    session = demo.session;
    messages = demo.messages;
    isDemo = true;
  } else if (isUuid(sessionId)) {
    try {
      const supabase = getServerClient();
      const [sessionRes, messagesRes] = await Promise.all([
        supabase
          .from("atticus_sessions")
          .select(
            "id, created_at, last_activity_at, handed_off_at, lead_name, lead_email, lead_phone, program_interest, lead_timeline, message_count, flagged_count, user_agent"
          )
          .eq("id", sessionId)
          .maybeSingle(),
        supabase
          .from("atticus_messages")
          .select("id, role, content, created_at, flagged, flag_reason")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true }),
      ]);
      session = (sessionRes.data as Session | null) ?? null;
      messages = (messagesRes.data ?? []) as Msg[];
    } catch {
      // Supabase unreachable — fall through to notFound below.
    }
  } else {
    notFound();
  }

  if (!session) notFound();

  const meta: Array<[string, string | null]> = [
    ["Name", session.lead_name],
    ["Email", session.lead_email],
    ["Phone", session.lead_phone],
    ["Program", session.program_interest],
    ["Timeline", session.lead_timeline],
  ];

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/leads"
          className="text-xs text-muted hover:text-teal transition-colors"
        >
          &larr; All leads
        </Link>
      </div>

      <div className="eyebrow mb-3">
        Transcript
        {isDemo && (
          <span className="ml-2 text-[10px] uppercase tracking-wider bg-paper-subtle border border-rule text-muted px-1.5 py-0.5 rounded">
            demo
          </span>
        )}
      </div>
      <h1 className="text-2xl md:text-3xl mb-2">
        {session.lead_name ?? "Unknown lead"}
      </h1>
      <p className="text-sm text-muted mb-8">
        Started {fmtDate(session.created_at)} · Handed off{" "}
        {fmtDate(session.handed_off_at)}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {meta.map(([label, value]) => (
          <div
            key={label}
            className="border border-rule bg-paper p-4 rounded-sm"
          >
            <div className="eyebrow mb-1">{label}</div>
            <div className="text-sm text-ink">
              {value ?? <span className="text-subtle">—</span>}
            </div>
          </div>
        ))}
      </div>

      {(session.flagged_count ?? 0) > 0 && (
        <div className="border border-red-200 bg-red-50 text-red-900 p-4 rounded-sm mb-6 text-sm">
          <span className="font-medium">
            {session.flagged_count} flagged message
            {session.flagged_count === 1 ? "" : "s"}
          </span>{" "}
          in this conversation. Messages with injection attempts or refusals are
          marked below.
        </div>
      )}

      <div className="space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-muted">No messages logged.</div>
        )}
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`rounded-sm border p-4 ${
                isUser
                  ? "border-rule bg-paper-subtle"
                  : "border-rule bg-paper"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`eyebrow ${isUser ? "text-navy" : "text-teal"}`}
                >
                  {isUser ? "Student" : "Atticus"}
                </span>
                <span className="text-xs text-subtle">
                  {fmtDate(m.created_at)}
                </span>
                {m.flagged && (
                  <span className="text-[10px] uppercase tracking-wider bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.5 rounded">
                    Flagged{m.flag_reason ? `: ${m.flag_reason}` : ""}
                  </span>
                )}
              </div>
              <div className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-subtle mt-10">
        Session ID: <code className="text-xs">{session.id}</code>
      </p>
    </div>
  );
}
