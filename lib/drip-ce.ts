/**
 * CE drip — the dentist / employer sequence.
 *
 * Five emails, one a week (day 0, 7, 14, 21, 28), sent to Florida dentists
 * from the FL DOH license list to harvest interest in Radiography and EFDA
 * training for their assistants. Copy approved by Tom 2026-09-18; sent to
 * Debbie & Ashley for sign-off the same day.
 *
 * Each step renders both an HTML part (600px table layout, inline styles,
 * images served from /email/ on the site — never embedded) and a plain-text
 * part. Resend sends them as multipart/alternative, which is what inbox
 * providers expect from mail people actually read.
 *
 * Server-only. Never import from a client component.
 */

import { MAILING_ADDRESS, type Prospect } from "./prospects-shared";
import { siteOrigin } from "./site-url";

export const CE_STEP_DELAYS_DAYS = [0, 7, 7, 7, 7]; // cumulative: 0, 7, 14, 21, 28
export const CE_STEP_COUNT = CE_STEP_DELAYS_DAYS.length;
export const CE_SCHEDULE_LABEL = "5 emails — one a week for 4 weeks";

export type CeMessage = { subject: string; text: string; html: string };

const NAVY = "#0f3d5e";
const TOUR_VIDEO_ID = "mPyxc7PWOvY";

// ------------------------------------------------------------
// Small HTML helpers. Everything is a <tr> inside one 600px table so
// Outlook, Gmail, iOS Mail and Android Gmail all render the same column.
// ------------------------------------------------------------

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function para(html: string, pad = "0 0 16px"): string {
  return `<tr><td style="padding:${pad};">${html}</td></tr>`;
}

function button(href: string, label: string): string {
  return (
    `<tr><td style="padding:4px 0 24px;"><a href="${href}" style="background:${NAVY};color:#ffffff;` +
    `text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:6px;display:inline-block;">${label}</a></td></tr>`
  );
}

function photo(origin: string, file: string, height: number, alt: string): string {
  return (
    `<tr><td style="padding:4px 0 20px;"><img src="${origin}/email/${file}" width="600" height="${height}" alt="${esc(alt)}" ` +
    `style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:8px;"></td></tr>`
  );
}

function video(id: string, label: string): string {
  const url = `https://www.youtube.com/watch?v=${id}`;
  return (
    `<tr><td style="padding:4px 0 20px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>` +
    `<td style="padding:0 14px 0 0;vertical-align:middle;"><a href="${url}" style="text-decoration:none;display:block;">` +
    `<img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" width="240" height="135" alt="${esc(label)}" style="display:block;width:240px;height:135px;border:0;border-radius:6px;"></a></td>` +
    `<td style="vertical-align:middle;font-size:15px;line-height:1.5;"><a href="${url}" style="color:${NAVY};font-weight:bold;text-decoration:underline;">&#9654;&nbsp; ${label}</a>` +
    `<br><span style="color:#4b5563;font-size:14px;">opens on YouTube</span></td></tr></table></td></tr>`
  );
}

function header(origin: string): string {
  return (
    `<tr><td align="center" style="padding:0 0 20px;border-bottom:1px solid #e5e7eb;">` +
    `<a href="${origin}" style="text-decoration:none;"><img src="${origin}/email/fida-logo.png" width="180" alt="Florida Institute of Dental Assisting" ` +
    `style="display:block;width:180px;height:auto;border:0;margin:0 auto;"></a></td></tr>`
  );
}

function atticus(origin: string): string {
  return (
    `<tr><td style="padding:12px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>` +
    `<td style="padding:0 8px 0 0;vertical-align:middle;"><a href="${origin}/admissions" style="text-decoration:none;">` +
    `<img src="${origin}/email/atticus.png" width="32" height="32" alt="Atticus" style="display:block;width:32px;height:32px;border:0;"></a></td>` +
    `<td style="vertical-align:middle;font-size:14px;line-height:1.4;color:#4b5563;">Questions? ` +
    `<a href="${origin}/admissions" style="color:${NAVY};font-weight:bold;text-decoration:none;">Ask Atticus</a>, our 24/7 AI Admission Advisor &rarr;</td>` +
    `</tr></table></td></tr>`
  );
}

function footer(unsubscribeUrl: string): string {
  return (
    `<tr><td align="center" style="padding:24px 0 0;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">` +
    `${esc(MAILING_ADDRESS)}<br>Don't want these emails? <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a></td></tr>`
  );
}

function signatureFull(origin: string): string {
  return (
    `<tr><td style="padding:16px 0 0;border-top:1px solid #e5e7eb;font-size:15px;line-height:1.5;">` +
    `<b>Debbie Sanders &amp; Ashley Sanders</b><br>Co-Founders | Florida Institute of Dental Assisting<br>` +
    `<span style="font-size:13px;color:#4b5563;">EFDA &amp; Radiography for Dental Personnel courses approved by the Florida Board of Dentistry<br>` +
    `Dental Assisting Program licensed by the Commission for Independent Education (#6501)<br>` +
    `Hybrid CE: online coursework + in-office capstone</span><br>` +
    `<a href="mailto:success@fldentalassisting.com" style="color:${NAVY};text-decoration:none;">success@fldentalassisting.com</a> | ` +
    `<a href="${origin}" style="color:${NAVY};text-decoration:none;">fldentalassisting.com</a> | ` +
    `<a href="tel:+19046743131" style="color:${NAVY};text-decoration:none;">904-674-3131</a></td></tr>` +
    atticus(origin)
  );
}

function signatureShort(origin: string): string {
  return (
    `<tr><td style="padding:16px 0 0;border-top:1px solid #e5e7eb;font-size:15px;line-height:1.5;">` +
    `<b>Debbie &amp; Ashley Sanders</b><br>Co-Founders, FIDA &middot; ` +
    `<a href="tel:+19046743131" style="color:${NAVY};text-decoration:none;">904-674-3131</a></td></tr>` +
    atticus(origin)
  );
}

function wrap(origin: string, greeting: string, rows: string, signature: string, unsubscribeUrl: string): string {
  return (
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="color-scheme" content="light"><title>Florida Institute of Dental Assisting</title></head>` +
    `<body style="margin:0;padding:0;background:#f3f4f6;">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;"><tr><td align="center" style="padding:24px 12px;">` +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;">` +
    `<tr><td style="padding:28px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" ` +
    `style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#1f2937;">` +
    header(origin) +
    para(esc(greeting), "24px 0 16px") +
    rows +
    signature +
    footer(unsubscribeUrl) +
    `</table></td></tr></table></td></tr></table></body></html>`
  );
}

// ------------------------------------------------------------
// Plain-text part. Same words, no markup, one blank line between blocks.
// ------------------------------------------------------------

const SIG_FULL_TEXT = [
  "Debbie Sanders & Ashley Sanders",
  "Co-Founders | Florida Institute of Dental Assisting",
  "EFDA & Radiography for Dental Personnel courses approved by the Florida Board of Dentistry",
  "Dental Assisting Program licensed by the Commission for Independent Education (#6501)",
  "Hybrid CE: online coursework + in-office capstone",
  "success@fldentalassisting.com | fldentalassisting.com | 904-674-3131",
];

const SIG_SHORT_TEXT = ["Debbie & Ashley Sanders", "Co-Founders, FIDA · 904-674-3131"];

function textBody(
  origin: string,
  greeting: string,
  blocks: string[],
  sig: string[],
  unsubscribeUrl: string
): string {
  return [
    greeting,
    "",
    ...blocks.flatMap((b) => [b, ""]),
    ...sig,
    "",
    `Questions? Ask Atticus, our 24/7 AI Admission Advisor: ${origin}/admissions`,
    "",
    "—",
    MAILING_ADDRESS,
    `Don't want these emails? Unsubscribe here: ${unsubscribeUrl}`,
  ].join("\n");
}

// ------------------------------------------------------------
// The five steps
// ------------------------------------------------------------

export function renderCeDrip(step: number, p: Prospect, unsubscribeUrl: string): CeMessage {
  const origin = siteOrigin();
  const last = p.last_name?.trim();
  const drName = last ? `Dr. ${last}` : "Doctor";
  const greeting = `${drName},`;
  const RAD = `${origin}/programs/dental-radiography-certification`;
  const EFDA = `${origin}/programs/efda-certification-florida`;
  const tourUrl = `https://www.youtube.com/watch?v=${TOUR_VIDEO_ID}`;

  switch (Math.min(Math.max(step, 0), CE_STEP_COUNT - 1)) {
    case 0: {
      const p1 =
        "Florida Institute of Dental Assisting (FIDA) helps Florida practices grow their assistants' skills without losing them from the chair.";
      const p2 =
        "Our EFDA and Radiography for Dental Personnel certifications are required by the Florida Board of Dentistry for dental assistants performing these regulated duties in Florida. Our courses are Florida Board of Dentistry-approved and designed to make meeting these requirements convenient for both the assistant and the practice.";
      const p3 =
        "Coursework is completed online, and the capstone is done right in your own office under your supervision.";
      return {
        subject: `Board-approved CE for your assistants, ${drName}`,
        html: wrap(
          origin,
          greeting,
          para(esc(p1)) +
            photo(origin, "classroom.jpg", 450, "Debbie Sanders instructing FIDA students chairside") +
            para(esc(p2)) +
            para(esc(p3)) +
            button(origin, "See how it works"),
          signatureFull(origin),
          unsubscribeUrl
        ),
        text: textBody(origin, greeting, [p1, p2, p3, `See how it works: ${origin}`], SIG_FULL_TEXT, unsubscribeUrl),
      };
    }
    case 1: {
      const p1 =
        "Unlicensed assistants need proper training before taking radiographs in Florida. FIDA's Radiography for Dental Personnel course covers it online, with the hands-on capstone in your own office.";
      const p2 =
        "Your assistant keeps working. You supervise the capstone. The course is approved by the Florida Board of Dentistry.";
      return {
        subject: "Your assistants can take x-rays in 30 days",
        html: wrap(
          origin,
          greeting,
          para(esc(p1)) +
            photo(origin, "xray-lab.jpg", 337, "FIDA instructor in the x-ray lab") +
            para(esc(p2)) +
            button(RAD, "Enroll an assistant in Radiography"),
          signatureShort(origin),
          unsubscribeUrl
        ),
        text: textBody(origin, greeting, [p1, p2, `Enroll an assistant in Radiography: ${RAD}`], SIG_SHORT_TEXT, unsubscribeUrl),
      };
    }
    case 2: {
      const p1 =
        "A well-trained EFDA can help your practice delegate more, improve efficiency, and give your doctors more time to focus on patient care.";
      const p2 =
        "In Florida, EFDA certification is required by the Florida Board of Dentistry for dental assistants to perform expanded functions. FIDA makes earning that certification simple for working dental assistants with a Florida Board-approved course designed around the needs of busy practices.";
      const p3 =
        "With online coursework and an in-office capstone, your assistants can advance their skills and earn their EFDA certification while your practice keeps its team in the office and patients on the schedule.";
      const p4 = "We'd love the opportunity to help your team grow.";
      return {
        subject: "What an EFDA does for your schedule",
        html: wrap(
          origin,
          greeting,
          para(esc(p1)) +
            para(esc(p2)) +
            photo(origin, "chairside.jpg", 450, "Dental assistant working chairside with the supervising dentist") +
            para(esc(p3)) +
            para(esc(p4)) +
            button(EFDA, "Start an assistant on EFDA"),
          signatureShort(origin),
          unsubscribeUrl
        ),
        text: textBody(origin, greeting, [p1, p2, p3, p4, `Start an assistant on EFDA: ${EFDA}`], SIG_SHORT_TEXT, unsubscribeUrl),
      };
    }
    case 3: {
      const p1 =
        "FIDA is a family-owned, private dental assisting school led by Debbie and Ashley. We believe great dental assisting education goes beyond teaching the “how”—our students learn the “why,” with a strong focus on patient safety, professionalism, and the skills dental practices truly value.";
      const p2 =
        "Debbie brings more than 16 years of dental assisting instruction experience, while Ashley brings over 12 years in practice administration. Together, they understand what Florida practices need from a confident, well-trained dental assistant.";
      const p3 =
        "And because we're family-owned, we take a personal approach to education and supporting the dental professionals and practices we serve.";
      return {
        subject: "Who trains your assistants matters",
        html: wrap(
          origin,
          greeting,
          para(esc(p1)) +
            photo(origin, "cohort.jpg", 337, "FIDA graduating cohort at the Jacksonville campus") +
            para(esc(p2)) +
            para(esc(p3)) +
            button(`${origin}/about`, "Meet Debbie &amp; Ashley"),
          signatureShort(origin),
          unsubscribeUrl
        ),
        text: textBody(origin, greeting, [p1, p2, p3, `Meet Debbie & Ashley: ${origin}/about`], SIG_SHORT_TEXT, unsubscribeUrl),
      };
    }
    default: {
      const p1 =
        "Just one last note from our team at FIDA. If anyone on your team is ready to take the next step with EFDA or Radiography training, we'd truly love the opportunity to support them.";
      const p2 = "Simply reply to this email or visit our website to learn more:";
      const p3 = "You can also watch a quick overview of FIDA here:";
      const p4 =
        "Thank you for investing in your team and supporting their continued growth. We hope to have the opportunity to work with your practice in the future!";
      return {
        subject: `Should I close your file, ${drName}?`,
        html: wrap(
          origin,
          greeting,
          para(esc(p1)) +
            para(`${esc(p2)} <a href="${origin}" style="color:${NAVY};">fldentalassisting.com</a>`) +
            para(esc(p3), "0 0 4px") +
            video(TOUR_VIDEO_ID, "Take the FIDA virtual tour") +
            para(esc(p4)) +
            button(`${origin}/programs`, "Enroll an assistant"),
          signatureFull(origin),
          unsubscribeUrl
        ),
        text: textBody(
          origin,
          greeting,
          [p1, `${p2} ${origin}`, `${p3} ${tourUrl}`, p4, `Enroll an assistant: ${origin}/programs`],
          SIG_FULL_TEXT,
          unsubscribeUrl
        ),
      };
    }
  }
}
