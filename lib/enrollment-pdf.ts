/**
 * Renders the signed Enrollment Agreement as a PDF (pdf-lib, no native deps —
 * runs on Vercel's Node runtime). Content comes from
 * lib/enrollment-agreement-text.ts so the filed PDF matches the page signed.
 * Layout follows the 6-page CIE form section for section.
 *
 * Called twice per agreement: once when the student signs (school-official
 * lines left blank) and again when staff countersigns (fully executed copy).
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as T from "@/lib/enrollment-agreement-text";
import { scheduleFor } from "@/lib/enrollment-schedule";

export type AgreementFields = {
  legal_name: string;
  dob: string;                 // YYYY-MM-DD
  email: string;
  address: string;             // street
  city_state_zip: string;
  phone_home: string;
  phone_cell: string;
  phone_work: string;
  emergency_name: string;
  emergency_relationship: string;
  emergency_phone: string;
  start_date: string;          // cohort option string as shown to the student
  payment_plan: T.PaymentPlan;
  military_spouse: boolean;
  initials: Record<T.InitialKey, string>;
};

export type Countersign = {
  name: string;
  title: string;
  signed_at: Date;
};

export type SignatureMeta = {
  signer_name: string;
  guardian_name: string | null;
  signed_at: Date;
  signer_ip: string;
  user_agent: string;
  agreement_id: string;
  version: string;
  countersign?: Countersign | null;
};

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 60;
const TEXT_W = PAGE_W - MARGIN * 2;
const NAVY = rgb(0.12, 0.23, 0.37);
const GREY = rgb(0.42, 0.45, 0.5);
const BLACK = rgb(0.1, 0.1, 0.1);
const RULE = rgb(0.85, 0.87, 0.9);

/** pdf-lib's WinAnsi fonts can't draw every glyph; swap the ones the form uses. */
function safe(s: string): string {
  return s
    .replace(/–|—/g, "-")
    .replace(/‘|’/g, "'")
    .replace(/“|”/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7e\xa0-\xff]/g, "?");
}

class Writer {
  doc: PDFDocument;
  page!: PDFPage;
  y = 0;
  font: PDFFont;
  bold: PDFFont;
  footers: PDFPage[] = [];

  constructor(doc: PDFDocument, font: PDFFont, bold: PDFFont) {
    this.doc = doc;
    this.font = font;
    this.bold = bold;
    this.newPage();
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.footers.push(this.page);
    this.y = PAGE_H - MARGIN;
  }

  ensure(h: number) {
    if (this.y - h < MARGIN + 20) this.newPage();
  }

  wrap(text: string, font: PDFFont, size: number, width: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) <= width) cur = test;
      else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  para(text: string, opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; indent?: number; after?: number; hang?: string } = {}) {
    text = safe(text);
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.font;
    const indent = opts.indent ?? 0;
    const lh = size * 1.35;
    const lines = this.wrap(text, font, size, TEXT_W - indent);
    lines.forEach((line, i) => {
      this.ensure(lh);
      if (i === 0 && opts.hang) {
        this.page.drawText(safe(opts.hang), { x: MARGIN + indent - 16, y: this.y - size, size, font, color: opts.color ?? BLACK });
      }
      this.page.drawText(line, { x: MARGIN + indent, y: this.y - size, size, font, color: opts.color ?? BLACK });
      this.y -= lh;
    });
    this.y -= opts.after ?? 6;
  }

  heading(text: string) {
    this.ensure(70);
    this.y -= 8;
    this.page.drawText(safe(text), { x: MARGIN, y: this.y - 12, size: 11, font: this.bold, color: NAVY });
    this.y -= 22;
  }

  kv(rows: [string, string][], labelW = 170) {
    for (const [k, v] of rows) {
      const size = 10;
      const lines = this.wrap(safe(v || "—"), this.font, size, TEXT_W - labelW);
      const h = Math.max(1, lines.length) * size * 1.35 + 4;
      this.ensure(h);
      this.page.drawText(safe(k), { x: MARGIN, y: this.y - size, size, font: this.bold, color: BLACK });
      lines.forEach((line, i) => {
        this.page.drawText(line, { x: MARGIN + labelW, y: this.y - size - i * size * 1.35, size, font: this.font, color: BLACK });
      });
      this.y -= h;
      this.page.drawLine({ start: { x: MARGIN, y: this.y + 1 }, end: { x: MARGIN + TEXT_W, y: this.y + 1 }, thickness: 0.5, color: RULE });
      this.y -= 3;
    }
    this.y -= 6;
  }

  /** Right-aligned "Student Initial: XX" line, matching the form. */
  initial(value: string) {
    const size = 10;
    this.ensure(size * 2);
    const label = "Student Initial:";
    const lw = this.bold.widthOfTextAtSize(label, size);
    const vw = this.bold.widthOfTextAtSize(value, 12);
    const x = MARGIN + TEXT_W - lw - vw - 10;
    this.page.drawText(label, { x, y: this.y - size, size, font: this.bold, color: BLACK });
    this.page.drawText(safe(value), { x: x + lw + 6, y: this.y - size, size: 12, font: this.bold, color: NAVY });
    this.page.drawLine({ start: { x: x + lw + 4, y: this.y - size - 3 }, end: { x: MARGIN + TEXT_W, y: this.y - size - 3 }, thickness: 0.6, color: BLACK });
    this.y -= size * 1.35 + 10;
  }

  rule(color = NAVY, thickness = 1.2) {
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: MARGIN + TEXT_W, y: this.y }, thickness, color });
    this.y -= 10;
  }

  center(text: string, size: number, font: PDFFont, color = BLACK) {
    text = safe(text);
    const w = font.widthOfTextAtSize(text, size);
    this.page.drawText(text, { x: (PAGE_W - w) / 2, y: this.y - size, size, font, color });
    this.y -= size * 1.4;
  }

  /** Simple bordered table. */
  table(cols: string[], rows: string[][], colW: number[]) {
    const size = 8.5;
    const pad = 4;
    const drawRow = (cells: string[], font: PDFFont) => {
      const wrapped = cells.map((c, i) => this.wrap(safe(c), font, size, colW[i] - pad * 2));
      const lines = Math.max(1, ...wrapped.map((w) => w.length));
      const h = lines * size * 1.3 + pad * 2;
      this.ensure(h);
      let x = MARGIN;
      wrapped.forEach((w, i) => {
        this.page.drawRectangle({ x, y: this.y - h, width: colW[i], height: h, borderColor: BLACK, borderWidth: 0.6 });
        w.forEach((line, li) => {
          this.page.drawText(line, { x: x + pad, y: this.y - pad - size - li * size * 1.3, size, font, color: BLACK });
        });
        x += colW[i];
      });
      this.y -= h;
    };
    drawRow(cols, this.bold);
    rows.forEach((r) => drawRow(r, this.font));
    this.y -= 8;
  }

  finish() {
    const n = this.footers.length;
    this.footers.forEach((p, i) => {
      const t = `${i + 1} of ${n}`;
      const w = this.font.widthOfTextAtSize(t, 9);
      p.drawText(t, { x: (PAGE_W - w) / 2, y: 30, size: 9, font: this.font, color: GREY });
    });
  }
}

function fmtDateTime(d: Date) {
  return d.toLocaleString("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "2-digit", day: "2-digit", year: "numeric" });
}

function fmtDob(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : s;
}

function ordinalDay(d: Date) {
  const day = Number(d.toLocaleDateString("en-US", { timeZone: "America/New_York", day: "numeric" }));
  const s = ["th", "st", "nd", "rd"][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
  return `${day}${s}`;
}

export async function renderAgreementPdf(fields: AgreementFields, sig: SignatureMeta): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Student Enrollment Agreement — ${fields.legal_name}`);
  doc.setAuthor(T.SCHOOL.name);
  doc.setCreationDate(sig.signed_at);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new Writer(doc, font, bold);
  const sched = scheduleFor(fields.start_date);
  const signedDate = fmtDate(sig.signed_at);

  // ---- Page 1: letterhead + student information + program information ----
  try {
    const png = await readFile(path.join(process.cwd(), "public", "fida-logo.png"));
    const img = await doc.embedPng(png);
    const lw = 140;
    const lh = (img.height / img.width) * lw;
    w.page.drawImage(img, { x: (PAGE_W - lw) / 2, y: w.y - lh, width: lw, height: lh });
    w.y -= lh + 6;
  } catch {
    /* logo missing — fall through to text letterhead */
  }
  w.center(T.SCHOOL.address, 10, font, BLACK);
  w.center(T.SCHOOL.email, 10, font, BLACK);
  w.center(T.SCHOOL.phone, 10, font, BLACK);
  w.y -= 12;
  w.center("STUDENT ENROLLMENT AGREEMENT", 15, bold, BLACK);
  w.center(`“${T.PROGRAM.title}”`, 12, font, BLACK);
  w.y -= 8;

  w.heading("STUDENT INFORMATION");
  w.kv([
    ["STUDENT NAME:", fields.legal_name],
    ["DATE OF BIRTH:", fmtDob(fields.dob)],
    ["ADDRESS:", fields.address],
    ["CITY/STATE/ZIP:", fields.city_state_zip],
    ["TELEPHONE #'S:", `H: ${fields.phone_home || "—"}   C: ${fields.phone_cell || "—"}   W: ${fields.phone_work || "—"}`],
    ["E-MAIL:", fields.email],
    ["SOCIAL SECURITY #:", "Collected in person at orientation (not on this electronic form)"],
    ["EMERGENCY CONTACT:", fields.emergency_name],
    ["RELATIONSHIP:", fields.emergency_relationship],
    ["EMERGENCY TELEPHONE #:", fields.emergency_phone],
  ]);

  w.heading("PROGRAM INFORMATION");
  w.kv([
    ["DATE OF ADMISSION:", signedDate],
    ["PROGRAM:", T.PROGRAM.title],
    ["PROGRAM START DATE:", sched?.start_date ?? fields.start_date],
    ["ANTICIPATED END DATE:", sched?.anticipated_end ?? "To be confirmed by the school"],
    ["CLASS TIME:", sched?.class_time ?? "To be confirmed by the school"],
    ["DAYS/CLASS MEETS:", sched?.days ?? "To be confirmed by the school"],
    ["TIME OF DAY CLASS BEGINS:", sched?.begins ?? "—"],
    ["TIME OF DAY CLASS ENDS:", sched?.ends ?? "—"],
    ["PROGRAM LENGTH:", `${T.PROGRAM.length}.`],
    ["TOTAL CLOCK HOURS:", T.PROGRAM.clockHours],
    ["CLASS SCHEDULE:", T.PROGRAM.schedule],
  ]);

  // ---- Total program cost ----
  w.heading("TOTAL PROGRAM COST");
  w.para(`THE TOTAL COST OF THE ${T.PROGRAM.title.toUpperCase()} PROGRAM`, { bold: true });
  w.kv([...T.FEES.map((f) => [f.item, f.amount] as [string, string]), [T.FEES_TOTAL.item, T.FEES_TOTAL.amount]], 300);

  w.heading("TUITION FEE INCLUDES");
  T.TUITION_INCLUDES.forEach((line) => w.para(line, { indent: 18, hang: "-", after: 2 }));
  w.y -= 6;

  w.heading("METHODS OF PAYMENT");
  w.para("IN-HOUSE PAYMENT PLANS:", { bold: true, after: 2 });
  T.IN_HOUSE_PLANS.forEach((line, i) => w.para(line, { indent: 18, hang: `${i + 1}.`, after: 2 }));
  w.y -= 4;
  w.para("THIRD PARTY LOAN PROGRAM:", { bold: true, after: 2 });
  w.para(T.THIRD_PARTY_LOAN);
  w.para(`Payment plan selected by the student: ${T.planLabel(fields.payment_plan)}`, { bold: true });

  // TILA box
  w.ensure(120);
  w.table(
    T.TILA_BOX.map((b) => b.head),
    [T.TILA_BOX.map((b) => b.body)],
    [96, 96, 100, 100, 100]
  );
  w.para(T.TILA_SCHEDULE_HEAD, { bold: true, after: 2 });
  w.table(T.TILA_SCHEDULE_COLS, [["", "", ""]], [150, 171, 171]);
  w.para(T.NO_CARRYING_CHARGES);

  w.heading("NON-DISCRIMINATION POLICY:");
  w.para(T.NON_DISCRIMINATION);

  w.heading(`${T.MILITARY_HEADING}:`);
  w.para(T.MILITARY_NOTE);
  w.para(`Student indicated eligibility for this reduction: ${fields.military_spouse ? "YES (verification required)" : "No"}`, { bold: true });

  w.heading("REFUND POLICY:");
  w.para(T.REFUND_INTRO);
  T.REFUND_SCHEDULE.forEach((line, i) => w.para(line, { indent: 18, hang: `${i + 1}.`, after: 3 }));
  w.y -= 4;

  w.heading("WITHDRAWAL POLICY:");
  w.para(T.WITHDRAWAL_POLICY);

  w.heading("GROUNDS FOR TERMINATION:");
  w.para(T.GROUNDS_FOR_TERMINATION);
  w.initial(fields.initials.termination);

  w.heading("THE STUDENT UNDERSTANDS:");
  T.STUDENT_UNDERSTANDS.forEach((line, i) => w.para(line, { indent: 18, hang: `${i + 1}.`, after: 3 }));
  w.initial(fields.initials.understands);

  w.heading("STUDENT ACKNOWLEDGEMENTS:");
  w.para(T.CATALOG_ACKNOWLEDGEMENT);
  w.initial(fields.initials.catalog);

  w.heading("EMPLOYMENT ASSISTANCE:");
  w.para(T.EMPLOYMENT_ASSISTANCE);
  w.initial(fields.initials.employment);

  w.para(T.ENTIRE_AGREEMENT);
  w.para(T.NOTICE_TO_PROSPECTIVE_STUDENTS, { bold: true });

  w.heading("CONTRACT ACCEPTANCE:");
  T.CONTRACT_ACCEPTANCE.forEach((p) => w.para(p));

  // ---- Signatures ----
  w.ensure(200);
  w.para(T.ESIGN_CONSENT, { size: 8.5, color: GREY });
  const signedMonth = sig.signed_at.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "long" });
  const signedYear = sig.signed_at.toLocaleDateString("en-US", { timeZone: "America/New_York", year: "numeric" });
  w.para(`Signed this ${ordinalDay(sig.signed_at)} day of ${signedMonth} ${signedYear}`, { bold: true });
  w.kv([
    ["Signature of Student", `/s/ ${sig.signer_name}   (electronically signed)`],
    ["Date", fmtDateTime(sig.signed_at)],
    ["Printed Student Name", fields.legal_name],
  ]);
  w.para(`Signature evidence: IP address ${sig.signer_ip} · ${sig.user_agent.slice(0, 110)}`, { size: 8, color: GREY });
  if (sig.guardian_name) {
    w.kv([
      ["Parent/Guardian Signature", `/s/ ${sig.guardian_name}   (student under 18; electronically signed)`],
      ["Date", fmtDateTime(sig.signed_at)],
    ]);
  }

  w.ensure(140);
  const cs = sig.countersign ?? null;
  w.kv([
    ["Signature of School Official", cs ? `/s/ ${cs.name}   (electronically signed)` : "________________________________"],
    ["Date", cs ? fmtDateTime(cs.signed_at) : "________________"],
    ["Printed School Official", cs ? `${cs.name}${cs.title ? `, ${cs.title}` : ""}` : "________________________________"],
  ]);

  w.para(T.REPRESENTATIVE_CERTIFICATION(fields.legal_name));
  w.kv([
    ["Signature of Representative", cs ? `/s/ ${cs.name}   (electronically signed)` : "________________________________"],
    ["Date", cs ? fmtDateTime(cs.signed_at) : "________________"],
    ["Printed Representative", cs ? `${cs.name}${cs.title ? `, ${cs.title}` : ""}` : "________________________________"],
  ]);

  w.y -= 4;
  w.para(
    `Agreement ID ${sig.agreement_id} · Version ${sig.version} · ${cs ? "Fully executed copy" : "Student-signed copy (awaiting school signature)"} generated by ${T.SCHOOL.site}`,
    { size: 7, color: GREY }
  );

  w.finish();
  return doc.save();
}
