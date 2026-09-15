/**
 * Enrollment Agreement — Entry Level Dental Assisting (diploma).
 *
 * SINGLE SOURCE for the agreement wording. Read by the public signing page
 * (/enroll/[token]) and by the PDF renderer (lib/enrollment-pdf.ts), so the
 * student signs exactly what gets filed.
 *
 * OFFICIAL VERSION (2026-09-15): wording is verbatim from Debbie's
 * "Student Enrollment Agreement 2024" (the CIE-filed form, Acrobat export
 * dated 2026-03-05). Where the form and the website differ (program length,
 * military discount wording, payment plans) the FORM wins here — Tom's call,
 * 2026-09-15. Do not "fix" the wording to match the site; change the site.
 *
 * Deliberately omitted from the web form: the Social Security # line
 * (collected in person at orientation — never on the web, never in email).
 *
 * Signed rows keep the AGREEMENT_VERSION they were signed under.
 */

export const AGREEMENT_VERSION = "elda-cie-2024";

export const SCHOOL = {
  name: "Florida Institute of Dental Assisting",
  legalName: "Florida Institute of Dental Assisting, LLC",
  address: "8761 Perimeter Park Blvd, Suite 107, Jacksonville, FL 32216",
  phone: "(904) 674-3131",
  email: "success@fldentalassisting.com",
  site: "fldentalassisting.com",
};

export const PROGRAM = {
  title: "Entry Level Dental Assisting",
  length: "7 1/2 months",
  clockHours: "378",
  schedule: "Full Time",
};

/** Fee table exactly as printed on page 2 of the form. */
export const FEES: { item: string; amount: string }[] = [
  { item: "TUITION", amount: "$9,100" },
  { item: "DEPOSIT (applied toward tuition)", amount: "$600" },
  { item: "NON-REFUNDABLE REGISTRATION FEE", amount: "$150" },
];
export const FEES_TOTAL = { item: "TOTAL COST", amount: "$9,850" };

export const TUITION_INCLUDES: string[] = [
  "“ESSENTIALS OF DENTAL ASSISTING” TEXTBOOK 7th EDITION by Bird/Robinson Copyright 2023. Additional material included with textbook.",
  "PERSONALIZED STUDY NOTEBOOK",
  "ONE SET OF PERSONALIZED SCRUBS",
  "ALL RELATED MATERIALS FOR HANDS-ON TRAINING",
];

export type PaymentPlan = "paid_in_full" | "in_house" | "tfc";

export const PAYMENT_PLANS: { value: PaymentPlan; label: string }[] = [
  { value: "paid_in_full", label: "In-house plan 1: Full payment at time of signing enrollment agreement." },
  { value: "in_house", label: "In-house plan 2: Application fee ($150) at the time of signing enrollment agreement, $600 deposit (applied toward tuition), with balance paid within 6 months of signing enrollment agreement by a payment plan." },
  { value: "tfc", label: "Third party loan program: TFC (Tuition Finance Company) 18-month plan — 3% APR for the first 6 months, then 8% APR for the remaining 12 months." },
];

export function planLabel(plan: PaymentPlan): string {
  return PAYMENT_PLANS.find((x) => x.value === plan)?.label ?? plan;
}

export const IN_HOUSE_PLANS: string[] = [
  "Full payment at time of signing enrollment agreement.",
  "Application fee ($150) at the time of signing enrollment agreement, $600 deposit (applied toward tuition), with balance paid within 6 months of signing enrollment agreement by a payment plan.",
];
export const THIRD_PARTY_LOAN =
  "Florida Institute of Dental Assisting partners with TFC (Tuition Finance Company) to offer flexible payment plans. Students may finance their tuition over an 18-month term with a tiered interest rate structure. Students will benefit from a low introductory interest rate of 3% APR for the first 6 months, which then adjusts to 8% APR for the remaining 12-month balance.";

/** Truth-in-Lending style box on page 3 of the form. */
export const TILA_BOX: { head: string; body: string }[] = [
  { head: "Annual Percentage Rate:", body: "3% for the first 6 months, then increasing to 8% for the remaining 12 months" },
  { head: "Finance Charge:", body: "" },
  { head: "Amount financed:", body: "the dollar amount of credit provided to you on or on your behalf." },
  { head: "Total of Payments:", body: "The amount you will have paid after you have made all payments as scheduled." },
  { head: "Total Sales Price:", body: "The total cost of your purchase on credit including your down payment of $750." },
];
export const TILA_SCHEDULE_HEAD = "YOUR PAYMENT SCHEDULE WILL BE:";
export const TILA_SCHEDULE_COLS = ["Number of Payments", "Amount of each payment", "When payments are due"];

export const NO_CARRYING_CHARGES =
  "All prices for the program are printed herein. There are no carrying charges, interest charges, or service charges connected or charged with this program. Contracts are not sold to a third party at any time. Cost of class is the price cost for the goods and services.";

export const NON_DISCRIMINATION =
  "It is the policy of Florida Institute of Dental Assisting to provide equal educational opportunities for all people regardless of race, color, religion, national origin, sex, age, marital status, personal appearance, sexual orientation, gender identity and expression, family responsibilities, political affiliation, disability, source of income, place of resident or business, and veteran status.";

export const MILITARY_HEADING = "MILITARY AND FIRST RESPONDER SPOUSE APPRECIATION";
export const MILITARY_NOTE =
  "Students that are spouses of active-duty military and first responders (firefighters, EMT’s, and police officers) will receive a reduction of the tuition fee in the amount of $1,500 until 12/31/2032 and is available to those who qualify.";

export const REFUND_INTRO =
  "Should a student’s enrollment be terminated or cancelled for any reason, all refunds will be made according to the following refund schedule:";

export const REFUND_SCHEDULE: string[] = [
  "Cancellation can be made in person, by electronic mail, by Certified Mail or by termination.",
  "All monies will be refunded if the school does not accept the applicant or if the student cancels within three (3) business days after signing the enrollment agreement and making initial payment.",
  "Cancellation after the third (3rd) Business Day, but before the first class, results in a refund of all monies paid, with the exception that of the registration fee (not to exceed $150.00).",
  "Cancellation after attendance has begun, though 40% completion of the program, will result in a pro-rated refund computed on the number of hours completed to the total program hours.",
  "Cancellation after completing more than 40% of the program will result in no refund.",
  "Termination date: In calculating the refund due to a student, the last date of actual attendance by the student is used in the calculation unless earlier written notice is received.",
  "Refunds will be made within 30 days of termination of students’ enrollment or receipt of Cancellation Notice from student.",
  "Textbooks are to be returned upon signing withdrawal form.",
];

export const WITHDRAWAL_POLICY =
  "Any student wishing to withdrawal from the dental assisting program must arrange a meeting with the administrator to discuss reason(s) for the withdrawal. Students must understand that contemplating withdrawing will affect tuition fees and refunds. Any student withdrawing from the program must receive an exit interview to discuss financial obligations, if any.";

/** Sections that carry a "Student Initial" box on the form, in order. */
export type InitialKey = "termination" | "understands" | "catalog" | "employment";
export const INITIAL_KEYS: InitialKey[] = ["termination", "understands", "catalog", "employment"];

export const GROUNDS_FOR_TERMINATION =
  "I agree to comply with the rules and policies and understand that the school shall have the right to terminate this contract and my enrollment at any time for violation of rules and policies as outlined in the catalog. I understand that the school reserves the right to modify the rules and regulations, and that I will be advised of any and all modifications. The school reserves the right to discontinue any students’ training for unsatisfactory progress, nonpayment of tuition or failure to abide by School rules.";

export const STUDENT_UNDERSTANDS: string[] = [
  "Florida Institute of Dental Assisting does not accept transfer of credits from another school for previous education, training, or work experience. Students who decide to transfer to another institution, the transferability of credit is at the discretion of the accepting institution, and that it is the student’s responsibility to confirm whether credits will be accepted by another institution of the student’s choice.",
  "The school reserves the right to reschedule the program start date when the number of students scheduled is too small.",
  "The school will not be responsible for any statement of policy or procedure that does not appear in the school catalog, or student enrollment agreement.",
  "If a student has been convicted of a felony, admission to the institution will be denied.",
  "Graduation requirements include: Tuition paid in full (to include all payment options) for completion of the program with a cumulative grade point average of 70% or more. Completion of a 160-hour externship with a licensed practicing dentist will earn the student their diploma.",
];

export const CATALOG_ACKNOWLEDGEMENT =
  "I hereby acknowledge receipt of the Florida Institute of Dental Assisting’s school catalog, which contains information describing programs offered, and equipment/supplies provided. The school’s catalog is included as a part of this enrollment agreement, and I acknowledge that I have received a copy of this catalog.";

export const EMPLOYMENT_ASSISTANCE =
  "I understand that the school has not made and will not make any guarantees of employment or salary upon my graduation. The school will provide me with placement assistance, which will consist of identifying employment opportunities and advising me on appropriate means of attempting to realize these opportunities.";

export const ENTIRE_AGREEMENT =
  "This contract contains the entire agreement between the school and myself, and no further modification or representation except as herein expressed in writing will be recognized.";

export const NOTICE_TO_PROSPECTIVE_STUDENTS =
  "NOTICE TO PROSPECTIVE STUDENTS: DO NOT SIGN THIS CONTRACT BEFORE YOU HAVE READ IT OR IF IT CONTAINS ANY BLANK SPACES. ALL SIGNERS HAVE RECEIVED AND READ A COPY OF THE BINDING DOCUMENT AND CATALOG.";

export const CONTRACT_ACCEPTANCE: string[] = [
  "I, the undersigned, have read and understand this agreement and acknowledge receipt of a copy. It is further understood and agreed that this agreement supersedes all prior or contemporaneous verbal or written agreements and may not be modified without the written agreement of the student and the school official. I also understand that if I default upon this agreement, I will be responsible for payment of any collection fees or attorney fees incurred by Florida Institute of Dental Assisting, LLC.",
  "My signature below signifies that I have read and understand all aspects of this agreement and do recognize my legal responsibilities regarding this contract.",
];

export const REPRESENTATIVE_CERTIFICATION = (studentName: string) =>
  `Representative’s certification: I hereby certify that ${studentName} has been interviewed by me and in my judgment, meets all requirements for acceptance as a student. I further certify that there have been no verbal or written agreements or promises other than those appearing on this agreement.`;

export const ESIGN_CONSENT =
  "By typing my initials and my name below and clicking Sign, I agree that my typed initials and name are my electronic signature, that they have the same legal effect as handwritten initials and a handwritten signature under the federal ESIGN Act and Florida’s Uniform Electronic Transaction Act, and that I consent to receive this agreement and related notices electronically.";
