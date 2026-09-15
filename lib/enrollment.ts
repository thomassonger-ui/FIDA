/**
 * Enrollment agreement flow — server only (service-role Supabase).
 *
 *   sendEnrollmentAgreement(studentId)  → row + email with signing link
 *   getAgreementByToken(token)          → for the public /enroll/[token] page
 *   signAgreement(token, fields, meta)  → PDF → student_documents + document_records,
 *                                         PDF emailed to student + staff, deposit email ($600 QBO link)
 *   countersignAgreement(agreementId)   → staff signs the School Official / Representative lines;
 *                                         fully executed PDF re-filed + emailed to student + staff
 *   markDepositPaid(agreementId)        → staff button
 *
 * Env: RESEND_API_KEY (+ DRIP_FROM / DRIP_REPLY_TO, shared with the drip),
 *      QBO_DEPOSIT_URL (the $600 Buy Button — optional until Ashley makes it),
 *      ENROLLMENT_NOTIFY_EMAIL (staff copy; default success@fldentalassisting.com).
 */

import { randomBytes, createHash } from "node:crypto";
import { getServerClient } from "./supabase";
import { siteOrigin } from "./site-url";
import { getStudentById, uploadStudentDocument, type Student } from "./students-db";
import { renderAgreementPdf, type AgreementFields } from "./enrollment-pdf";
import { AGREEMENT_VERSION, INITIAL_KEYS, SCHOOL, planLabel, type InitialKey, type PaymentPlan } from "./enrollment-agreement-text";
import { scheduleFor } from "./enrollment-schedule";
import { SEAT_DEPOSIT_DUE, SEAT_DEPOSIT, REGISTRATION_FEE } from "./payment";

export type AgreementStatus = "sent" | "signed" | "void";

export type EnrollmentAgreement = {
  id: string;
  student_id: string;
  token: string;
  version: string;
  status: AgreementStatus;
  sent_at: string;
  sent_by: string | null;
  expires_at: string;
  signed_at: string | null;
  signer_name: string | null;
  signer_email: string | null;
  signer_ip: string | null;
  signer_user_agent: string | null;
  guardian_name: string | null;
  fields: Partial<AgreementFields>;
  pdf_sha256: string | null;
  student_document_id: number | null;
  document_record_id: number | null;
  deposit_email_sent_at: string | null;
  deposit_paid_at: string | null;
  countersigned_at: string | null;
  countersigner_name: string | null;
  countersigner_title: string | null;
  countersigned_pdf_sha256: string | null;
  countersigned_document_record_id: number | null;
  created_at: string;
};

const TABLE = "enrollment_agreements";

/** Programs that use this agreement. Everything else (EFDA, Radiography CE) enrols via Moodle. */
export function programUsesAgreement(program: string | null | undefined): boolean {
  if (!program) return false;
  return /entry|diploma|foundation|elda/i.test(program);
}

// ------------------------------------------------------------
// Reads
// ------------------------------------------------------------

export async function latestAgreementForStudent(studentId: string): Promise<EnrollmentAgreement | null> {
  try {
    const supabase = getServerClient();
    const { data } = await supabase
      .from(TABLE)
      .select("*")
      .eq("student_id", studentId)
      .neq("status", "void")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as EnrollmentAgreement) ?? null;
  } catch {
    return null;
  }
}

export async function getAgreementByToken(
  token: string
): Promise<{ agreement: EnrollmentAgreement; student: Student } | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  try {
    const supabase = getServerClient();
    const { data } = await supabase.from(TABLE).select("*").eq("token", token).maybeSingle();
    if (!data) return null;
    const student = await getStudentById((data as EnrollmentAgreement).student_id);
    if (!student) return null;
    return { agreement: data as EnrollmentAgreement, student };
  } catch {
    return null;
  }
}

export function signingUrl(token: string): string {
  return `${siteOrigin()}/enroll/${token}`;
}

// ------------------------------------------------------------
// Send
// ------------------------------------------------------------

export async function sendEnrollmentAgreement(
  studentId: string,
  sentBy: string
): Promise<{ ok: true; agreement: EnrollmentAgreement } | { ok: false; error: string }> {
  const student = await getStudentById(studentId);
  if (!student) return { ok: false, error: "Student not found." };
  if (!student.email) return { ok: false, error: "Student has no email address." };

  const existing = await latestAgreementForStudent(studentId);
  if (existing?.status === "signed") {
    return { ok: false, error: "This student has already signed the enrollment agreement." };
  }

  const supabase = getServerClient();
  // Any earlier unsigned link stops working.
  await supabase.from(TABLE).update({ status: "void" }).eq("student_id", studentId).eq("status", "sent");

  const token = randomBytes(24).toString("base64url");
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ student_id: studentId, token, version: AGREEMENT_VERSION, sent_by: sentBy })
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "insert failed" };
  const agreement = data as EnrollmentAgreement;

  const first = (student.full_name || "").split(" ")[0] || "there";
  const mail = await sendMail({
    to: student.email,
    subject: "Your FIDA enrollment agreement — please sign",
    text: [
      `Hi ${first},`,
      "",
      `Thank you — your ${REGISTRATION_FEE} registration fee is in and your spot in the Entry Level Dental Assisting diploma program is being held.`,
      "",
      "Next step: review and sign your enrollment agreement online. It takes about five minutes.",
      "",
      `Sign here: ${signingUrl(token)}`,
      "",
      `After you sign, you'll get one more email with the link to pay the ${SEAT_DEPOSIT_DUE} remainder of your ${SEAT_DEPOSIT} seat deposit (your ${REGISTRATION_FEE} registration already counts toward it). That payment secures your seat.`,
      "",
      "This link is personal to you and expires in 30 days. Questions? Just reply to this email.",
      "",
      "Debbie & Ashley",
      SCHOOL.name,
      `${SCHOOL.phone} · ${SCHOOL.email}`,
    ].join("\n"),
  });
  if (!mail.ok) {
    await supabase.from(TABLE).update({ status: "void" }).eq("id", agreement.id);
    return { ok: false, error: `Email failed: ${mail.error}` };
  }
  return { ok: true, agreement };
}

// ------------------------------------------------------------
// Sign
// ------------------------------------------------------------

export type SignInput = {
  fields: AgreementFields;
  signer_name: string;
  guardian_name: string | null;
  ip: string;
  user_agent: string;
};

const PLANS: PaymentPlan[] = ["paid_in_full", "in_house", "tfc"];

/** 2–4 letters, matches the first letters of the legal name's words (e.g. "Mary Ann Smith" → MAS or MS). */
function initialsMatch(initials: string, legalName: string): boolean {
  const parts = legalName.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  const all = parts.map((p) => p[0].toUpperCase()).join("");
  const firstLast = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  const v = initials.toUpperCase().replace(/[^A-Z]/g, "");
  return v.length >= 2 && (v === all || v === firstLast);
}

export function isMinor(dob: string, at = new Date()): boolean {
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const b = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const eighteenth = new Date(Date.UTC(b.getUTCFullYear() + 18, b.getUTCMonth(), b.getUTCDate()));
  return at < eighteenth;
}

export function validateSignInput(raw: unknown): { input: SignInput } | { error: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const s = (k: string, max = 200) => String(r[k] ?? "").trim().slice(0, max);
  const rawInitials = (r.initials ?? {}) as Record<string, unknown>;
  const initials = Object.fromEntries(
    INITIAL_KEYS.map((k) => [k, String(rawInitials[k] ?? "").trim().toUpperCase().slice(0, 4)])
  ) as Record<InitialKey, string>;
  const fields: AgreementFields = {
    legal_name: s("legal_name", 120),
    dob: s("dob", 10),
    email: s("email", 160).toLowerCase(),
    address: s("address", 200),
    city_state_zip: s("city_state_zip", 120),
    phone_home: s("phone_home", 40),
    phone_cell: s("phone_cell", 40),
    phone_work: s("phone_work", 40),
    emergency_name: s("emergency_name", 120),
    emergency_relationship: s("emergency_relationship", 60),
    emergency_phone: s("emergency_phone", 40),
    start_date: s("start_date", 120),
    payment_plan: s("payment_plan", 20) as PaymentPlan,
    military_spouse: r.military_spouse === true || r.military_spouse === "on" || r.military_spouse === "true",
    initials,
  };
  const signer_name = s("signer_name", 120);
  const guardian_name = s("guardian_name", 120) || null;

  if (fields.legal_name.length < 3 || !/\s/.test(fields.legal_name)) return { error: "Enter your full legal name (first and last)." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.dob)) return { error: "Enter your date of birth." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return { error: "Enter a valid email address." };
  if (fields.address.length < 5) return { error: "Enter your street address." };
  if (fields.city_state_zip.length < 8) return { error: "Enter your city, state and ZIP." };
  if (fields.phone_cell.length < 7 && fields.phone_home.length < 7) return { error: "Enter at least a cell or home phone number." };
  if (fields.emergency_name.length < 3) return { error: "Enter an emergency contact name." };
  if (fields.emergency_relationship.length < 2) return { error: "Enter your relationship to the emergency contact." };
  if (fields.emergency_phone.length < 7) return { error: "Enter the emergency contact's phone number." };
  if (!scheduleFor(fields.start_date)) return { error: "Choose the class you are enrolling in." };
  if (!PLANS.includes(fields.payment_plan)) return { error: "Choose a payment plan." };
  for (const k of INITIAL_KEYS) {
    if (!initialsMatch(fields.initials[k], fields.legal_name))
      return { error: "Please type your initials in each of the four \"Student Initial\" boxes (they must match your legal name)." };
  }
  if (signer_name.toLowerCase() !== fields.legal_name.toLowerCase())
    return { error: "Your typed signature must match your legal name exactly." };
  if (isMinor(fields.dob) && !guardian_name)
    return { error: "A parent or guardian must also sign because you are under 18." };
  if (r.consent !== true && r.consent !== "on" && r.consent !== "true")
    return { error: "Please check the box to agree to sign electronically." };

  return { input: { fields, signer_name, guardian_name, ip: "", user_agent: "" } };
}

export async function signAgreement(
  token: string,
  input: SignInput
): Promise<{ ok: true; agreement: EnrollmentAgreement; depositUrl: string | null } | { ok: false; error: string }> {
  const found = await getAgreementByToken(token);
  if (!found) return { ok: false, error: "This signing link is not valid." };
  const { agreement, student } = found;
  if (agreement.status === "signed") return { ok: false, error: "This agreement has already been signed." };
  if (agreement.status === "void") return { ok: false, error: "This link has been replaced. Check your email for a newer one." };
  if (new Date(agreement.expires_at) < new Date()) return { ok: false, error: "This link has expired. Ask FIDA to send a new one." };

  const signedAt = new Date();
  const pdf = await renderAgreementPdf(input.fields, {
    signer_name: input.signer_name,
    guardian_name: input.guardian_name,
    signed_at: signedAt,
    signer_ip: input.ip,
    user_agent: input.user_agent,
    agreement_id: agreement.id,
    version: agreement.version,
  });
  const buffer = Buffer.from(pdf);
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const safeName = input.fields.legal_name.replace(/[^\w]+/g, "_");
  const filename = `Enrollment_Agreement_${safeName}_${signedAt.toISOString().slice(0, 10)}.pdf`;

  // 1) Student file (shows on /admin/students/[id] and in the student portal)
  const up = await uploadStudentDocument({
    studentId: student.id,
    filename,
    mimeType: "application/pdf",
    buffer,
    uploadedBy: "student",
    uploadedByEmail: input.fields.email,
    label: "Enrollment Agreement",
    isRequired: true,
  });
  if ("error" in up) return { ok: false, error: `Could not file the signed PDF: ${up.error}` };

  // 2) Document vault copy (/admin/documents) — WORM record, locked.
  const recordId = await fileInVault({
    student, filename, buffer, sha256,
    notes: `E-signed ${signedAt.toISOString()} by ${input.signer_name} from ${input.ip}. Agreement ${agreement.id} (${agreement.version}).`,
  });

  const supabase = getServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      status: "signed",
      signed_at: signedAt.toISOString(),
      signer_name: input.signer_name,
      signer_email: input.fields.email,
      signer_ip: input.ip,
      signer_user_agent: input.user_agent.slice(0, 300),
      guardian_name: input.guardian_name,
      fields: input.fields,
      pdf_sha256: sha256,
      student_document_id: up.doc.id,
      document_record_id: recordId,
    })
    .eq("id", agreement.id)
    .eq("status", "sent")
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not record the signature." };
  const signed = data as EnrollmentAgreement;

  // Keep the student row current with what they told us.
  await supabase
    .from("students")
    .update({ full_name: input.fields.legal_name, phone: input.fields.phone_cell || input.fields.phone_home || input.fields.phone_work || null })
    .eq("id", student.id);

  // 3) Deposit email + staff notice — failures here don't undo the signature.
  const depositUrl = process.env.QBO_DEPOSIT_URL?.trim() || null;
  const first = input.fields.legal_name.split(" ")[0];
  const attachment = { filename, content: buffer.toString("base64") };
  const deposit = await sendMail({
    to: input.fields.email,
    subject: `Signed — next, your ${SEAT_DEPOSIT_DUE} seat deposit`,
    attachments: [attachment],
    text: [
      `Hi ${first},`,
      "",
      "Your enrollment agreement is signed and on file. Thank you! A copy of what you signed is attached to this email. Once the school signs, you'll receive the fully executed copy.",
      "",
      `Last step to secure your seat: pay the ${SEAT_DEPOSIT_DUE} remainder of your ${SEAT_DEPOSIT} seat deposit (your ${REGISTRATION_FEE} registration fee already counts toward it).`,
      "",
      depositUrl ? `Pay the ${SEAT_DEPOSIT_DUE} deposit here: ${depositUrl}` : `We'll send your ${SEAT_DEPOSIT_DUE} deposit invoice from our QuickBooks account shortly — watch for an email from Intuit.`,
      "",
      `Payment plan you selected: ${planLabel(input.fields.payment_plan)}`,
      input.fields.military_spouse ? "You indicated you are the spouse of an active-duty military member or first responder — bring proof to orientation so we can apply the $1,500 reduction." : "",
      "",
      "Once the deposit is in, we'll confirm your seat and send your acceptance packet with orientation details.",
      "",
      "Debbie & Ashley",
      SCHOOL.name,
      `${SCHOOL.phone} · ${SCHOOL.email}`,
    ].filter((l) => l !== null).join("\n"),
  });
  if (deposit.ok) {
    await supabase.from(TABLE).update({ deposit_email_sent_at: new Date().toISOString() }).eq("id", agreement.id);
  }

  const notify = process.env.ENROLLMENT_NOTIFY_EMAIL?.trim() || SCHOOL.email;
  await sendMail({
    to: notify,
    subject: `Enrollment agreement signed — ${input.fields.legal_name}`,
    attachments: [attachment],
    text: [
      `${input.fields.legal_name} signed the Entry Level enrollment agreement at ${signedAt.toLocaleString("en-US", { timeZone: "America/New_York" })} ET. The signed PDF is attached and filed in the student record and the document vault.`,
      "",
      `Plan: ${planLabel(input.fields.payment_plan)}${input.fields.military_spouse ? " (military/first-responder SPOUSE reduction claimed — verify)" : ""}`,
      `Class: ${input.fields.start_date || "not specified"}`,
      input.guardian_name ? `Guardian signed: ${input.guardian_name} (student under 18)` : "",
      "",
      `NEXT: open the student record and click "Countersign" to sign the School Official and Representative lines. The fully executed copy is then emailed to the student and to you.`,
      `Student record: ${siteOrigin()}/admin/students/${student.id}`,
      `Vault: ${siteOrigin()}/admin/documents`,
      "",
      depositUrl
        ? `The ${SEAT_DEPOSIT_DUE} deposit email went out automatically${deposit.ok ? "" : " — BUT IT FAILED: " + deposit.error}. Mark it paid on the student page when it lands in QBO.`
        : `QBO_DEPOSIT_URL is not set, so the student was told a QuickBooks invoice is coming — please send the ${SEAT_DEPOSIT_DUE} invoice from QBO.`,
    ].filter((l) => l !== null).join("\n"),
  });

  return { ok: true, agreement: signed, depositUrl };
}

export async function countersignAgreement(
  agreementId: string,
  by: { name: string; title: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = by.name.trim().slice(0, 120);
  const title = by.title.trim().slice(0, 80);
  if (name.length < 3) return { ok: false, error: "Type your full name to countersign." };
  const supabase = getServerClient();
  const { data } = await supabase.from(TABLE).select("*").eq("id", agreementId).maybeSingle();
  const agreement = data as EnrollmentAgreement | null;
  if (!agreement || agreement.status !== "signed") return { ok: false, error: "The student hasn't signed yet." };
  if (agreement.countersigned_at) return { ok: false, error: "This agreement is already countersigned." };
  const student = await getStudentById(agreement.student_id);
  if (!student) return { ok: false, error: "Student not found." };
  const fields = agreement.fields as AgreementFields;
  if (!fields?.legal_name || !fields.initials) return { ok: false, error: "This agreement was signed under an older form and can't be countersigned online." };

  const now = new Date();
  const pdf = await renderAgreementPdf(fields, {
    signer_name: agreement.signer_name ?? fields.legal_name,
    guardian_name: agreement.guardian_name,
    signed_at: new Date(agreement.signed_at ?? agreement.created_at),
    signer_ip: agreement.signer_ip ?? "",
    user_agent: agreement.signer_user_agent ?? "",
    agreement_id: agreement.id,
    version: agreement.version,
    countersign: { name, title, signed_at: now },
  });
  const buffer = Buffer.from(pdf);
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const safeName = fields.legal_name.replace(/[^\w]+/g, "_");
  const filename = `Enrollment_Agreement_${safeName}_EXECUTED_${now.toISOString().slice(0, 10)}.pdf`;

  const up = await uploadStudentDocument({
    studentId: student.id,
    filename,
    mimeType: "application/pdf",
    buffer,
    uploadedBy: "staff",
    uploadedByEmail: null,
    label: "Enrollment Agreement (fully executed)",
    isRequired: false,
  });
  if ("error" in up) return { ok: false, error: `Could not file the executed PDF: ${up.error}` };
  const recordId = await fileInVault({
    student, filename, buffer, sha256,
    notes: `Countersigned ${now.toISOString()} by ${name}${title ? ` (${title})` : ""}. Student e-signed ${agreement.signed_at}. Agreement ${agreement.id} (${agreement.version}).`,
  });

  const { error } = await supabase
    .from(TABLE)
    .update({
      countersigned_at: now.toISOString(),
      countersigner_name: name,
      countersigner_title: title || null,
      countersigned_pdf_sha256: sha256,
      countersigned_document_record_id: recordId,
    })
    .eq("id", agreement.id);
  if (error) return { ok: false, error: error.message };

  const attachment = { filename, content: buffer.toString("base64") };
  const first = fields.legal_name.split(" ")[0];
  const studentMail = await sendMail({
    to: agreement.signer_email || fields.email || student.email,
    subject: "Your fully executed FIDA enrollment agreement",
    attachments: [attachment],
    text: [
      `Hi ${first},`,
      "",
      `${SCHOOL.name} has signed your enrollment agreement. The fully executed copy is attached for your records; it's also in your student portal under Documents.`,
      "",
      "Welcome — we'll be in touch with your acceptance packet and orientation details.",
      "",
      "Debbie & Ashley",
      SCHOOL.name,
      `${SCHOOL.phone} · ${SCHOOL.email}`,
    ].join("\n"),
  });
  const notify = process.env.ENROLLMENT_NOTIFY_EMAIL?.trim() || SCHOOL.email;
  await sendMail({
    to: notify,
    subject: `Enrollment agreement executed — ${fields.legal_name}`,
    attachments: [attachment],
    text: [
      `${name} countersigned ${fields.legal_name}'s enrollment agreement at ${now.toLocaleString("en-US", { timeZone: "America/New_York" })} ET. Fully executed PDF attached and filed in the student record and the document vault.`,
      studentMail.ok ? "The student was emailed the executed copy." : `Emailing the student FAILED: ${studentMail.error}`,
      "",
      `Student record: ${siteOrigin()}/admin/students/${student.id}`,
      `Vault: ${siteOrigin()}/admin/documents`,
    ].join("\n"),
  });
  return { ok: true };
}

export async function markDepositPaid(agreementId: string, paid: boolean): Promise<boolean> {
  try {
    const supabase = getServerClient();
    const { error } = await supabase
      .from(TABLE)
      .update({ deposit_paid_at: paid ? new Date().toISOString() : null })
      .eq("id", agreementId);
    return !error;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------
// Vault (document_records) — mirrors app/api/admin/documents/route.ts
// ------------------------------------------------------------

async function fileInVault(input: {
  student: Student;
  filename: string;
  buffer: Buffer;
  sha256: string;
  notes: string;
}): Promise<number | null> {
  try {
    const supabase = getServerClient();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const storagePath = `${input.student.id}/${timestamp}_${input.filename}`;
    const { error: upErr } = await supabase.storage
      .from("document-vault")
      .upload(storagePath, input.buffer, { contentType: "application/pdf", upsert: false });
    if (upErr) return null;
    const now = new Date();
    const retExpires = new Date(now);
    retExpires.setFullYear(retExpires.getFullYear() + 5);
    const { data, error } = await supabase
      .from("document_records")
      .insert({
        student_id: input.student.id,
        student_name: input.student.full_name || input.student.email,
        category: "enrollment_agreement",
        program: null,
        filename: input.filename,
        file_size_kb: Math.round(input.buffer.byteLength / 1024),
        mime_type: "application/pdf",
        storage_path: storagePath,
        sha256: input.sha256,
        uploaded_by: "e-sign",
        retention_years: 5,
        retention_expires: retExpires.toISOString().slice(0, 10),
        locked: true,
        notes: input.notes,
      })
      .select("id")
      .single();
    if (error || !data) {
      await supabase.storage.from("document-vault").remove([storagePath]);
      return null;
    }
    return data.id as number;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------
// Mail — transactional (no List-Unsubscribe; these aren't marketing)
// ------------------------------------------------------------

async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: string }[]; // content = base64
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY is not set." };
  const from = process.env.ENROLLMENT_FROM || process.env.DRIP_FROM || process.env.RESEND_FROM || "FIDA Admissions <reply@fldentalassisting.com>";
  const payload: Record<string, unknown> = { from, to: [opts.to], subject: opts.subject, text: opts.text };
  if (opts.attachments?.length) payload.attachments = opts.attachments;
  const rt = process.env.DRIP_REPLY_TO;
  if (rt) payload.reply_to = rt;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { message?: string };
      return { ok: false, error: j.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}
