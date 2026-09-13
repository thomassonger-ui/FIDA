/**
 * Enrollment Agreement — Entry Level Dental Assisting (diploma).
 *
 * SINGLE SOURCE for the agreement wording. Read by the public signing page
 * (/enroll/[token]) and by the PDF renderer (lib/enrollment-pdf.ts), so the
 * student signs exactly what gets filed.
 *
 * INTERIM VERSION (2026-09-13). Matches docs/reference/templates/
 * FIDA-Enrollment-Agreement-ELDA-interim.docx. When Ashley supplies the
 * catalog-filed agreement, replace the sections below and bump
 * AGREEMENT_VERSION — signed rows keep the version they were signed under.
 *
 * Numbers come from lib/payment.ts (never retype them here). The refund
 * schedule is verbatim from the CIE catalog (lib/i18n/legal.ts) — do not
 * reword.
 */

import {
  REGISTRATION_FEE, SEAT_DEPOSIT, SEAT_DEPOSIT_DUE, TUITION, TOTAL_COST,
  BALANCE_AFTER_DEPOSIT, PLAN_6_MONTHLY, PLAN_8_MONTHLY, MILITARY_DISCOUNT,
  MILITARY_TUITION, MILITARY_BALANCE_AFTER_DEPOSIT, MILITARY_PLAN_6_MONTHLY,
  MILITARY_PLAN_8_MONTHLY,
} from "@/lib/payment";

export const AGREEMENT_VERSION = "elda-interim-2026-09";

export const SCHOOL = {
  name: "Florida Institute of Dental Assisting",
  address: "8761 Perimeter Park Blvd, Ste. 107, Jacksonville, FL 32216",
  phone: "(904) 674-3131",
  email: "success@fldentalassisting.com",
  site: "fldentalassisting.com",
  license: "Licensed by the Florida Commission for Independent Education · License No. 6501",
};

export const PROGRAM = {
  title: "Entry Level Dental Assisting — Diploma Program",
  credential: "Diploma",
  length: "6 months · 378 clock hours (142 theory · 76 lab · 160 externship)",
  delivery:
    "In person at the Jacksonville campus, plus a 160-hour externship in a working dental office under a licensed dentist",
};

export type PaymentPlan = "plan_6" | "plan_8" | "tfc" | "paid_in_full";

export const PAYMENT_PLANS: { value: PaymentPlan; label: string; military: string }[] = [
  { value: "plan_6", label: `In-house, interest-free — 6 monthly payments of ${PLAN_6_MONTHLY}`, military: `In-house, interest-free — 6 monthly payments of ${MILITARY_PLAN_6_MONTHLY}` },
  { value: "plan_8", label: `In-house, interest-free — 8 monthly payments of ${PLAN_8_MONTHLY}`, military: `In-house, interest-free — 8 monthly payments of ${MILITARY_PLAN_8_MONTHLY}` },
  { value: "tfc", label: "TFC Tuition Financing — 18-month plan (subject to TFC approval)", military: "TFC Tuition Financing — 18-month plan (subject to TFC approval)" },
  { value: "paid_in_full", label: "Paid in full", military: "Paid in full" },
];

export function planLabel(plan: PaymentPlan, military: boolean): string {
  const p = PAYMENT_PLANS.find((x) => x.value === plan);
  if (!p) return plan;
  return military ? p.military : p.label;
}

export const FEES: { item: string; amount: string; due: string }[] = [
  { item: "Registration fee (non-refundable)", amount: REGISTRATION_FEE, due: "At registration, paid online" },
  { item: "Seat deposit", amount: SEAT_DEPOSIT, due: `When the application and this agreement are submitted. The ${REGISTRATION_FEE} registration fee counts toward the deposit, so ${SEAT_DEPOSIT_DUE} is due at this step.` },
  { item: "Tuition", amount: TUITION, due: `Balance of ${BALANCE_AFTER_DEPOSIT} after the deposit, on the payment plan selected` },
  { item: "Total program cost", amount: TOTAL_COST, due: "Tuition + registration fee" },
];

export const FEES_NOTE =
  "Books, supplies, uniforms, and any required background screening or immunizations are described in the school catalog and are not included above unless stated.";

export const MILITARY_NOTE = `Eligible active-duty, veteran, and first-responder students receive a ${MILITARY_DISCOUNT} tuition incentive (${MILITARY_TUITION} total; ${MILITARY_BALANCE_AFTER_DEPOSIT} balance after the deposit). Verified with a military ID or DD214.`;

export const PAYMENT_METHODS =
  "Accepted payment methods: card, ACH, check, and cash. Monthly payments are due on the date shown on the student's payment schedule. Certificates, diplomas, and transcripts are released when the student's account is paid in full.";

export const REFUND_INTRO =
  "Should a student's enrollment be terminated or cancelled for any reason, all refunds will be made according to the following refund schedule:";

export const REFUND_SCHEDULE: string[] = [
  "All monies will be refunded if the school does not accept the applicant or if the student cancels within three (3) business days after signing the enrollment agreement and making initial payment.",
  "Cancellation after the third (3rd) Business Day, but before the first class, results in a refund of all monies paid, with the exception of the registration fee (not to exceed $150.00).",
  "Cancellation after attendance has begun, through 40% completion of the program, will result in a pro-rated refund computed on the number of hours completed to the total program hours.",
  "Cancellation after completing more than 40% of the program will result in no refund.",
  "Termination date: In calculating the refund due to a student, the last date of actual attendance by the student is used in the calculation unless earlier written notice is received.",
  "Refunds will be made within 30 days of termination of students' enrollment or receipt of cancellation notice from the student.",
];

export const REFUND_NOTICE = `Notice of cancellation must be given in writing to the school at the address above or by email to ${SCHOOL.email}.`;

export const ACKNOWLEDGMENTS: string[] = [
  "I have received, or been given access to, the school catalog, and I have read the program description, attendance, conduct, and satisfactory academic progress policies it contains.",
  "I understand the program is delivered in person in Jacksonville, Florida, and includes a 160-hour externship in a dental office arranged with the school.",
  "I understand the school does not guarantee employment or a specific wage upon graduation.",
  "I understand the school does not participate in federal Title IV financial aid programs.",
  "I have been advised of the total cost of the program and the refund policy before signing.",
  "I understand that any changes to this agreement must be made in writing and signed by both the student and the school.",
];

export const NON_DISCRIMINATION =
  "Florida Institute of Dental Assisting does not and shall not discriminate on the basis of race, color, religion, gender, gender expression, age, national origin, disability, marital status, sexual orientation, or military status, in any of its activities or operations. Applicants and students who need a reasonable accommodation because of a disability are encouraged to contact the school so the request can be discussed individually.";

export const LICENSURE =
  "The Entry Level Dental Assisting diploma program is licensed by the Florida Commission for Independent Education, Florida Department of Education (License No. 6501). Additional information regarding this institution may be obtained by contacting the Commission at 325 West Gaines Street, Suite 1414, Tallahassee, FL 32399-0400, toll-free 888-224-6684. Concerns that cannot be resolved with the school may be directed to the Commission.";

export const ENTIRE_AGREEMENT =
  "This agreement, together with the school catalog, is the entire agreement between the student and the school. It is not binding until it has been signed by the student (and a parent or guardian if the student is under 18) and accepted by an authorized school official. The student will receive a copy of the signed agreement.";

export const ESIGN_CONSENT =
  "By typing my name below and clicking Sign, I agree that my typed name is my electronic signature, that it has the same legal effect as a handwritten signature under the federal ESIGN Act and Florida's Uniform Electronic Transaction Act, and that I consent to receive this agreement and related notices electronically.";
