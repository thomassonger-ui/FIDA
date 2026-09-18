import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { upsertStudent } from "@/lib/students-db";
import { getServerClient } from "@/lib/supabase";
import { latestAgreementForStudent } from "@/lib/enrollment";
import { AGREEMENT_VERSION } from "@/lib/enrollment-agreement-text";
import { sendMail, staffNotifyAddress } from "@/lib/mail";
import { siteOrigin } from "@/lib/site-url";
import { REGISTRATION_FEE } from "@/lib/payment";

/**
 * POST /api/register/start
 *
 * Self-serve entry point for the application modal on /register. Creates (or
 * reuses) the student record, opens an enrollment agreement, and returns the
 * signing token so the modal can render the agreement inline — the visitor
 * never leaves the page.
 *
 * Until now only staff could open an agreement, via
 * /api/admin/students/[id]/agreement. This route is PUBLIC, so it is
 * deliberately narrow:
 *
 *   - honeypot field ("company") — bots fill it, humans never see it
 *   - per-IP rate limit, in-memory, best effort
 *   - source is stamped "self-serve" so Ashley can tell these apart from
 *     records staff created
 *   - it does NOT mark anything paid; it only opens an unsigned agreement.
 *     Signing still goes through the existing /api/enroll/[token]/sign route
 *     with all of its validation.
 *
 * It emails one staff notice (fire-and-forget) so Ashley hears about a
 * prospective student at the moment they start, not only if they finish.
 *
 * A student who already signed is refused rather than handed a second
 * agreement — staff sort that out by phone.
 */

export const dynamic = "force-dynamic";

const TABLE = "enrollment_agreements";

/* ---- rate limit -------------------------------------------------------- */
/* In-memory and per-instance: serverless means several instances, so this is a
   speed bump against casual abuse, not a guarantee. Good enough for a form
   that creates a DB row and sends no mail. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // crude ceiling, avoids unbounded growth
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "").trim() || "unknown";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Honeypot. Real visitors never see this field, so anything in it is a bot.
  // Answer 200 so the bot believes it succeeded and doesn't retry.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, token: null });
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many attempts. Please call us and we'll finish this with you." },
      { status: 429 },
    );
  }

  const fullName = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim() || null;
  const cohortId = String(body.cohort_id ?? "").trim() || null;
  /* The visitor clicked "I've paid" on the QuickBooks step before opening this
     modal. It is a CLAIM, never a confirmation — QuickBooks does not call the
     site back — so it only colours the staff email and is never written to the
     student record. */
  const feeClaimed = body.fee_paid === true;

  if (fullName.length < 2) {
    return NextResponse.json({ error: "Please enter your full legal name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const result = await upsertStudent({
    email,
    full_name: fullName,
    phone,
    program: "entry-level-dental-assisting",
    cohort_id: cohortId,
    source: "self-serve",
  });
  if ("error" in result) {
    return NextResponse.json({ error: "Could not start your application." }, { status: 500 });
  }
  const student = result.student;

  // Already signed? Don't quietly hand out a second agreement.
  const existing = await latestAgreementForStudent(student.id);
  if (existing?.status === "signed") {
    return NextResponse.json({ error: "already_signed" }, { status: 409 });
  }
  // An unsigned link that's still valid is reused, so a visitor who closes the
  // modal and comes back doesn't pile up agreement rows.
  if (existing?.status === "sent" && new Date(existing.expires_at) > new Date()) {
    return NextResponse.json({ ok: true, token: existing.token });
  }

  const supabase = getServerClient();
  await supabase.from(TABLE).update({ status: "void" }).eq("student_id", student.id).eq("status", "sent");

  const token = randomBytes(24).toString("base64url");
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      student_id: student.id,
      token,
      version: AGREEMENT_VERSION,
      sent_by: "self-serve",
    })
    .select("token")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Could not start your application." }, { status: 500 });
  }

  /* Tell Ashley someone started. Deliberately fire-and-forget: a mail outage
     must never stop a prospective student from reaching their agreement. */
  void notifyStarted({ fullName, email, phone, cohortId, studentId: student.id, feeClaimed });

  return NextResponse.json({ ok: true, token: data.token });
}

async function notifyStarted(a: {
  fullName: string;
  email: string;
  phone: string | null;
  cohortId: string | null;
  studentId: string;
  feeClaimed: boolean;
}) {
  try {
    await sendMail({
      to: staffNotifyAddress(),
      subject: a.feeClaimed
        ? `${REGISTRATION_FEE} reported paid + application started — ${a.fullName}`
        : `Application started — ${a.fullName}`,
      text: [
        a.feeClaimed
          ? `${a.fullName} says they paid the ${REGISTRATION_FEE} registration fee, and has just started their application with the enrollment agreement open.`
          : `${a.fullName} just started an application on the website and has their enrollment agreement open.`,
        "",
        `Email: ${a.email}`,
        `Phone: ${a.phone || "not given"}`,
        `Class: ${a.cohortId || "not sure yet"}`,
        "",
        ...(a.feeClaimed
          ? [
              `CONFIRM THE ${REGISTRATION_FEE} IN QUICKBOOKS BEFORE TREATING IT AS PAID.`,
              "QuickBooks doesn't notify the website when a payment clears, so this only",
              "means the visitor clicked \"I've paid\". Match it by name and email in QBO.",
              "",
            ]
          : []),
        "They have NOT signed yet — you'll get a second email with the signed PDF when they do.",
        "If this one goes quiet, it's someone worth a call.",
        "",
        `Student record: ${siteOrigin()}/admin/students/${a.studentId}`,
      ].join("\n"),
    });
  } catch {
    /* best effort */
  }
}
