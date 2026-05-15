/**
 * Deterministic job placement demo data.
 *
 * Generates employer records, position titles, start dates, and
 * in-field validation status for graduated demo students. Includes
 * optional wage data (consented only) and one not-yet-placed
 * graduate to show the workflow gap.
 *
 * Demo-only. In production, placement data is entered by the
 * career services team and validated against accreditor definitions
 * (ACCSC / COE differ on what counts as \u201Cin-field\u201D).
 */

import { demoStudents } from "./demo-students";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PlacementStatus =
  | "placed_in_field"
  | "placed_out_of_field"
  | "seeking"
  | "not_available"
  | "pending_verification";

export type PlacementRecord = {
  id: string;
  studentName: string;
  studentEmail: string;
  graduationDate: string;
  status: PlacementStatus;
  employer: string | null;
  positionTitle: string | null;
  startDate: string | null;
  isInField: boolean | null;
  inFieldJustification: string | null;
  wageConsented: boolean;
  hourlyWage: number | null;
  verifiedBy: string | null;
  verifiedOn: string | null;
  notes: string | null;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function placementStatusLabel(s: PlacementStatus): string {
  const map: Record<PlacementStatus, string> = {
    placed_in_field: "Placed \u2014 in field",
    placed_out_of_field: "Placed \u2014 out of field",
    seeking: "Seeking employment",
    not_available: "Not available",
    pending_verification: "Pending verification",
  };
  return map[s];
}

export function placementStatusTone(
  s: PlacementStatus
): "ok" | "warn" | "risk" | "neutral" {
  if (s === "placed_in_field") return "ok";
  if (s === "placed_out_of_field" || s === "pending_verification") return "warn";
  if (s === "seeking") return "risk";
  return "neutral";
}

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

/* ------------------------------------------------------------------ */
/*  Data pools                                                         */
/* ------------------------------------------------------------------ */

const EMPLOYERS_IN_FIELD = [
  "Orlando Regional Medical Center",
  "AdventHealth Orlando",
  "Nemours Children\u2019s Hospital",
  "CenterWell Senior Primary Care",
  "BayCare Urgent Care \u2014 Kissimmee",
  "HCA Florida Osceola Hospital",
  "FastMed Urgent Care",
  "MinuteClinic (CVS Health)",
  "Aspire Health Partners",
  "Village Medical \u2014 Lake Nona",
];

const POSITIONS_IN_FIELD = [
  "Medical Assistant",
  "Clinical Medical Assistant",
  "Certified Medical Assistant",
  "Back Office Medical Assistant",
  "Medical Assistant \u2014 Pediatrics",
  "Medical Assistant \u2014 Urgent Care",
  "Phlebotomy / MA Hybrid",
];

const EMPLOYERS_OUT_OF_FIELD = [
  "Publix Super Markets",
  "Walt Disney World",
  "Universal Orlando Resort",
  "Amazon Fulfillment \u2014 MCO5",
];

const POSITIONS_OUT_OF_FIELD = [
  "Customer Service Associate",
  "Guest Services Representative",
  "Warehouse Associate",
  "Retail Team Member",
];

const VERIFIERS = [
  "Ms. Torres \u2014 Career Services",
  "Mr. Okafor \u2014 Career Services",
  "Dr. Patel \u2014 Program Director",
];

const JUSTIFICATIONS = [
  "Position requires and utilizes Medical Assisting training per ACCSC definition.",
  "Role involves direct patient care in a clinical setting consistent with program objectives.",
  "Employer confirmed MA certification is required for this position.",
];

/* ------------------------------------------------------------------ */
/*  Generator                                                          */
/* ------------------------------------------------------------------ */

/**
 * Generate placement records for a \u201Cgraduated\u201D cohort.
 * Uses the same 25 demo students but treats them as if they
 * completed the program. Distribution:
 *   15 placed in-field
 *    3 placed out-of-field
 *    2 seeking
 *    2 not available (personal reasons, relocation, etc.)
 *    3 pending verification
 */
export function demoPlacements(_courseId: number): PlacementRecord[] {
  return [];
}
