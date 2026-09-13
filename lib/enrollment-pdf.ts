/**
 * Renders the signed Enrollment Agreement as a PDF (pdf-lib, no native deps —
 * runs on Vercel's Node runtime). Content comes from
 * lib/enrollment-agreement-text.ts so the filed PDF matches the page signed.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import * as T from "@/lib/enrollment-agreement-text";

export type AgreementFields = {
  legal_name: string;
  dob: string;            // YYYY-MM-DD
  email: string;
  phone: string;
  address: string;
  emergency_contact: string;
  start_date: string;     // free text as shown to the student
  payment_plan: T.PaymentPlan;
  military: boolean;
};

export type SignatureMeta = {
  signer_name: string;
  guardian_name: string | null;
  signed_at: Date;
  signer_ip: string;
  user_agent: string;
  agreement_id: string;
  version: string;
};

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 60;
const TEXT_W = PAGE_W - MARGIN * 2;
const NAVY = rgb(0.12, 0.23, 0.37);
const GREY = rgb(0.42, 0.45, 0.5);
const BLACK = rgb(0.1, 0.1, 0.1);

class Writer {
  doc: PDFDocument;
  page!: PDFPage;
  y = 0;
  font: PDFFont;
  bold: PDFFont;
  pageNo = 0;
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
    const size = opts.size ?? 10;
    const font = opts.bold ? this.bold : this.font;
    const indent = opts.indent ?? 0;
    const lh = size * 1.35;
    const lines = this.wrap(text, font, size, TEXT_W - indent);
    lines.forEach((line, i) => {
      this.ensure(lh);
      if (i === 0 && opts.hang) {
        this.page.drawText(opts.hang, { x: MARGIN + indent - 14, y: this.y - size, size, font, color: opts.color ?? BLACK });
      }
      this.page.drawText(line, { x: MARGIN + indent, y: this.y - size, size, font, color: opts.color ?? BLACK });
      this.y -= lh;
    });
    this.y -= opts.after ?? 6;
  }

  heading(text: string) {
    this.ensure(70); // heading + at least two lines of body
    this.y -= 8;
    this.page.drawText(text, { x: MARGIN, y: this.y - 12, size: 12, font: this.bold, color: NAVY });
    this.y -= 22;
  }

  kv(rows: [string, string][], labelW = 150) {
    for (const [k, v] of rows) {
      const size = 10;
      const lines = this.wrap(v || "—", this.font, size, TEXT_W - labelW);
      const h = Math.max(1, lines.length) * size * 1.35 + 4;
      this.ensure(h);
      this.page.drawText(k, { x: MARGIN, y: this.y - size, size, font: this.bold, color: BLACK });
      lines.forEach((line, i) => {
        this.page.drawText(line, { x: MARGIN + labelW, y: this.y - size - i * size * 1.35, size, font: this.font, color: BLACK });
      });
      this.y -= h;
      this.page.drawLine({ start: { x: MARGIN, y: this.y + 1 }, end: { x: MARGIN + TEXT_W, y: this.y + 1 }, thickness: 0.5, color: rgb(0.85, 0.87, 0.9) });
      this.y -= 3;
    }
    this.y -= 6;
  }

  rule(color = NAVY, thickness = 1.2) {
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: MARGIN + TEXT_W, y: this.y }, thickness, color });
    this.y -= 10;
  }

  center(text: string, size: number, font: PDFFont, color = BLACK) {
    const w = font.widthOfTextAtSize(text, size);
    this.page.drawText(text, { x: (PAGE_W - w) / 2, y: this.y - size, size, font, color });
    this.y -= size * 1.4;
  }

  finish() {
    const n = this.footers.length;
    this.footers.forEach((p, i) => {
      const t = `FIDA Enrollment Agreement · ${T.PROGRAM.title} · Page ${i + 1} of ${n}`;
      const w = this.font.widthOfTextAtSize(t, 8);
      p.drawText(t, { x: (PAGE_W - w) / 2, y: 30, size: 8, font: this.font, color: GREY });
    });
  }
}

function fmtDate(d: Date) {
  return d.toLocaleString("en-US", { timeZone: "America/New_York", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}

function fmtDob(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : s;
}

export async function renderAgreementPdf(fields: AgreementFields, sig: SignatureMeta): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Enrollment Agreement — ${fields.legal_name}`);
  doc.setAuthor(T.SCHOOL.name);
  doc.setCreationDate(sig.signed_at);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new Writer(doc, font, bold);

  // Letterhead
  try {
    const png = await readFile(path.join(process.cwd(), "public", "fida-logo.png"));
    const img = await doc.embedPng(png);
    const lw = 150;
    const lh = (img.height / img.width) * lw;
    w.page.drawImage(img, { x: (PAGE_W - lw) / 2, y: w.y - lh, width: lw, height: lh });
    w.y -= lh + 6;
  } catch {
    w.center(T.SCHOOL.name.toUpperCase(), 14, bold, NAVY);
  }
  w.center(`${T.SCHOOL.address} · ${T.SCHOOL.phone} · ${T.SCHOOL.email} · ${T.SCHOOL.site}`, 8, font, GREY);
  w.rule();
  w.center(T.SCHOOL.license, 8, font, GREY);
  w.y -= 8;
  w.center("ENROLLMENT AGREEMENT", 16, bold, BLACK);
  w.center(T.PROGRAM.title, 11, font, BLACK);
  w.y -= 10;

  w.heading("1. Student Information");
  w.kv([
    ["Legal name", fields.legal_name],
    ["Date of birth", fmtDob(fields.dob)],
    ["Email", fields.email],
    ["Phone", fields.phone],
    ["Mailing address", fields.address],
    ["Emergency contact", fields.emergency_contact],
  ]);

  w.heading("2. Program Information");
  w.kv([
    ["Program", T.PROGRAM.title],
    ["Credential awarded", T.PROGRAM.credential],
    ["Program length", T.PROGRAM.length],
    ["Delivery", T.PROGRAM.delivery],
    ["Class start date", fields.start_date || "To be confirmed by the school"],
  ]);

  w.heading("3. Tuition and Fees");
  for (const f of T.FEES) {
    w.para(`${f.item} — ${f.amount}`, { bold: true, after: 0 });
    w.para(f.due, { indent: 12, color: GREY, size: 9 });
  }
  w.para(T.FEES_NOTE, { size: 9, color: GREY });
  w.para(`Payment plan selected: ${T.planLabel(fields.payment_plan, fields.military)}`, { bold: true });
  w.para(`Military / first responder incentive: ${fields.military ? "APPLIED (verification required)" : "Not applied"}. ${T.MILITARY_NOTE}`);
  w.para(T.PAYMENT_METHODS);

  w.heading("4. Cancellation and Refund Policy");
  w.para(T.REFUND_INTRO);
  T.REFUND_SCHEDULE.forEach((line, i) => w.para(line, { indent: 18, hang: `${i + 1}.` }));
  w.para(T.REFUND_NOTICE);

  w.heading("5. Student Acknowledgments");
  w.para("By signing below, I confirm that:");
  T.ACKNOWLEDGMENTS.forEach((line) => w.para(line, { indent: 18, hang: "•" }));

  w.heading("6. Non-Discrimination");
  w.para(T.NON_DISCRIMINATION);

  w.heading("7. Licensure and Complaints");
  w.para(T.LICENSURE);

  w.heading("8. Entire Agreement");
  w.para(T.ENTIRE_AGREEMENT);

  w.heading("9. Signatures");
  w.para(T.ESIGN_CONSENT, { size: 9, color: GREY });
  w.ensure(120);
  w.para("Student", { bold: true, after: 2 });
  w.para(`Electronically signed by: ${sig.signer_name}`, { after: 0 });
  w.para(`Date: ${fmtDate(sig.signed_at)}`, { after: 0 });
  w.para(`IP address ${sig.signer_ip} · ${sig.user_agent.slice(0, 110)}`, { size: 8, color: GREY });
  if (sig.guardian_name) {
    w.para("Parent or guardian (student under 18)", { bold: true, after: 2 });
    w.para(`Electronically signed by: ${sig.guardian_name}`, { after: 0 });
    w.para(`Date: ${fmtDate(sig.signed_at)}`, { size: 10 });
  }
  w.para("Accepted for Florida Institute of Dental Assisting", { bold: true, after: 2 });
  w.para("Signature: ______________________________________     Date: ________________", { after: 0 });
  w.para("Name / title: ___________________________________");
  w.y -= 6;
  w.para(`Agreement ID ${sig.agreement_id} · Version ${sig.version} · Signed copy generated by fldentalassisting.com`, { size: 7, color: GREY });

  w.finish();
  return doc.save();
}
