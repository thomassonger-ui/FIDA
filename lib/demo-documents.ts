/**
 * Deterministic document vault demo data.
 *
 * Generates sample document records with SHA-256 hashes, timestamps,
 * and document categories for the demo student roster. These represent
 * what the vault would look like once populated \u2014 enrollment
 * agreements, ID verification, transcripts, SAP notices, disclosures.
 *
 * Demo-only. In production, documents are uploaded to Supabase Storage
 * (or S3 Object Lock for WORM compliance) and a `document_records`
 * table stores the hash, uploader, timestamp, and retention metadata.
 */

import { demoStudents } from "./demo-students";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type DocumentCategory =
  | "enrollment_agreement"
  | "financial_disclosure"
  | "id_verification"
  | "transcript"
  | "sap_notice"
  | "appeal_decision"
  | "placement_verification"
  | "other";

export type DocumentRecord = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentId: number;
  category: DocumentCategory;
  filename: string;
  fileSizeKb: number;
  mimeType: string;
  sha256: string;
  uploadedBy: string;
  uploadedAt: string; // ISO datetime
  retentionYears: number;
  retentionExpires: string; // ISO date
  locked: boolean; // WORM lock status
  notes: string | null;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function categoryLabel(c: DocumentCategory): string {
  const map: Record<DocumentCategory, string> = {
    enrollment_agreement: "Enrollment agreement",
    financial_disclosure: "Financial disclosure",
    id_verification: "ID verification",
    transcript: "Transcript",
    sap_notice: "SAP notice",
    appeal_decision: "Appeal decision",
    placement_verification: "Placement verification",
    other: "Other",
  };
  return map[c];
}

export function categoryTone(
  c: DocumentCategory
): "blue" | "green" | "amber" | "red" | "neutral" {
  if (c === "enrollment_agreement" || c === "financial_disclosure") return "blue";
  if (c === "id_verification" || c === "transcript") return "green";
  if (c === "sap_notice" || c === "appeal_decision") return "red";
  if (c === "placement_verification") return "amber";
  return "neutral";
}

export const RETENTION_YEARS: Record<DocumentCategory, number> = {
  enrollment_agreement: 6,
  financial_disclosure: 6,
  id_verification: 5,
  transcript: 50, // permanent for practical purposes
  sap_notice: 6,
  appeal_decision: 6,
  placement_verification: 5,
  other: 3,
};

/* ------------------------------------------------------------------ */
/*  PRNG                                                               */
/* ------------------------------------------------------------------ */

function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Fake but deterministic hex string that looks like a SHA-256 hash. */
function fakeHash(rng: () => number): string {
  let h = "";
  for (let i = 0; i < 64; i++) {
    h += Math.floor(rng() * 16).toString(16);
  }
  return h;
}

/* ------------------------------------------------------------------ */
/*  Uploaders                                                          */
/* ------------------------------------------------------------------ */

const UPLOADERS = [
  "admin@blueprint.edu",
  "registrar@blueprint.edu",
  "admissions@blueprint.edu",
  "careerservices@blueprint.edu",
];

/* ------------------------------------------------------------------ */
/*  Generator                                                          */
/* ------------------------------------------------------------------ */

/**
 * Generate document records for a cohort. Each student gets 2\u20134
 * documents depending on their tier (at-risk students also get SAP
 * notices).
 */
export function demoDocuments(courseId: number): DocumentRecord[] {
  const students = demoStudents(courseId);
  const rng = prng(courseId * 866025 + 223607);
  const docs: DocumentRecord[] = [];
  let idx = 0;

  const baseDate = new Date("2026-01-10");

  for (const stu of students) {
    // Everyone gets enrollment agreement + ID verification
    const enrollDate = new Date(baseDate);
    enrollDate.setDate(enrollDate.getDate() + Math.floor(rng() * 5));

    docs.push({
      id: `doc-${idx++}`,
      studentName: stu.fullname,
      studentEmail: stu.email,
      studentId: stu.id,
      category: "enrollment_agreement",
      filename: `${stu.lastname}_${stu.firstname}_enrollment_agreement.pdf`.toLowerCase(),
      fileSizeKb: 180 + Math.floor(rng() * 120),
      mimeType: "application/pdf",
      sha256: fakeHash(rng),
      uploadedBy: pick(rng, UPLOADERS),
      uploadedAt: enrollDate.toISOString(),
      retentionYears: RETENTION_YEARS.enrollment_agreement,
      retentionExpires: `${enrollDate.getFullYear() + RETENTION_YEARS.enrollment_agreement}-${String(enrollDate.getMonth() + 1).padStart(2, "0")}-${String(enrollDate.getDate()).padStart(2, "0")}`,
      locked: true,
      notes: null,
    });

    docs.push({
      id: `doc-${idx++}`,
      studentName: stu.fullname,
      studentEmail: stu.email,
      studentId: stu.id,
      category: "id_verification",
      filename: `${stu.lastname}_${stu.firstname}_id_scan.pdf`.toLowerCase(),
      fileSizeKb: 90 + Math.floor(rng() * 60),
      mimeType: "application/pdf",
      sha256: fakeHash(rng),
      uploadedBy: pick(rng, UPLOADERS),
      uploadedAt: enrollDate.toISOString(),
      retentionYears: RETENTION_YEARS.id_verification,
      retentionExpires: `${enrollDate.getFullYear() + RETENTION_YEARS.id_verification}-${String(enrollDate.getMonth() + 1).padStart(2, "0")}-${String(enrollDate.getDate()).padStart(2, "0")}`,
      locked: true,
      notes: null,
    });

    // Financial disclosure for ~80%
    if (rng() > 0.2) {
      const fdDate = new Date(enrollDate);
      fdDate.setDate(fdDate.getDate() + 1);
      docs.push({
        id: `doc-${idx++}`,
        studentName: stu.fullname,
        studentEmail: stu.email,
        studentId: stu.id,
        category: "financial_disclosure",
        filename: `${stu.lastname}_${stu.firstname}_financial_disclosure.pdf`.toLowerCase(),
        fileSizeKb: 60 + Math.floor(rng() * 40),
        mimeType: "application/pdf",
        sha256: fakeHash(rng),
        uploadedBy: pick(rng, UPLOADERS),
        uploadedAt: fdDate.toISOString(),
        retentionYears: RETENTION_YEARS.financial_disclosure,
        retentionExpires: `${fdDate.getFullYear() + RETENTION_YEARS.financial_disclosure}-${String(fdDate.getMonth() + 1).padStart(2, "0")}-${String(fdDate.getDate()).padStart(2, "0")}`,
        locked: true,
        notes: null,
      });
    }

    // SAP notices for at-risk and some watch students
    if (stu.riskTier === "risk" || (stu.riskTier === "watch" && rng() > 0.5)) {
      const sapDate = new Date("2026-02-15");
      sapDate.setDate(sapDate.getDate() + Math.floor(rng() * 14));
      const cat: DocumentCategory =
        stu.riskTier === "risk" && rng() > 0.5
          ? "appeal_decision"
          : "sap_notice";
      docs.push({
        id: `doc-${idx++}`,
        studentName: stu.fullname,
        studentEmail: stu.email,
        studentId: stu.id,
        category: cat,
        filename: `${stu.lastname}_${stu.firstname}_${cat}.pdf`.toLowerCase(),
        fileSizeKb: 40 + Math.floor(rng() * 30),
        mimeType: "application/pdf",
        sha256: fakeHash(rng),
        uploadedBy: pick(rng, UPLOADERS),
        uploadedAt: sapDate.toISOString(),
        retentionYears: RETENTION_YEARS[cat],
        retentionExpires: `${sapDate.getFullYear() + RETENTION_YEARS[cat]}-${String(sapDate.getMonth() + 1).padStart(2, "0")}-${String(sapDate.getDate()).padStart(2, "0")}`,
        locked: true,
        notes:
          cat === "appeal_decision"
            ? "Appeal reviewed by committee. See attached decision letter."
            : "SAP warning issued per 34 CFR 668.34.",
      });
    }
  }

  return docs.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}
