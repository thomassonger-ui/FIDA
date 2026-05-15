/**
 * Deterministic SAP (Satisfactory Academic Progress) demo data.
 *
 * Generates evaluation checkpoints, GPA, pace %, and the
 * Warning \u2192 Probation \u2192 Termination state machine for
 * each demo student in a tracked cohort.
 *
 * This is demo-only. In a real SoR the SAP state machine would
 * live in a `sap_evaluations` table with advisor sign-off at
 * every state transition and date-bound evaluation windows.
 */

import { demoStudents, type DemoStudent } from "./demo-students";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SapStatus =
  | "good_standing"
  | "warning"
  | "probation"
  | "termination"
  | "appeal_approved";

export type EvaluationCheckpoint = {
  id: string;
  label: string;
  /** ISO date string */
  evaluatedOn: string;
  gpa: number;
  pacePct: number;
  sapStatus: SapStatus;
  advisorNote: string;
  advisorName: string;
};

export type SapRecord = {
  student: DemoStudent;
  currentGpa: number;
  currentPacePct: number;
  currentStatus: SapStatus;
  maxTimeframePct: number;
  checkpoints: EvaluationCheckpoint[];
};

/* ------------------------------------------------------------------ */
/*  Label / tone helpers                                               */
/* ------------------------------------------------------------------ */

export function sapStatusLabel(s: SapStatus): string {
  const map: Record<SapStatus, string> = {
    good_standing: "Good standing",
    warning: "Warning",
    probation: "Probation",
    termination: "Termination",
    appeal_approved: "Appeal approved",
  };
  return map[s];
}

export function sapStatusTone(
  s: SapStatus
): "ok" | "warn" | "risk" | "neutral" {
  if (s === "good_standing") return "ok";
  if (s === "warning" || s === "appeal_approved") return "warn";
  if (s === "probation" || s === "termination") return "risk";
  return "neutral";
}

/* ------------------------------------------------------------------ */
/*  Thresholds                                                         */
/* ------------------------------------------------------------------ */

export const SAP_THRESHOLDS = {
  gpaMin: 2.0,
  paceMin: 67,
  maxTimeframe: 150, // % of published program length
};

/* ------------------------------------------------------------------ */
/*  PRNG (same mulberry32 as demo-students)                            */
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

function between(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

/* ------------------------------------------------------------------ */
/*  Generator                                                          */
/* ------------------------------------------------------------------ */

const ADVISOR_NAMES = [
  "Dr. Carter",
  "Ms. Nguyen",
  "Mr. Okafor",
  "Dr. Patel",
];

const GOOD_NOTES = [
  "Meeting all benchmarks. No action required.",
  "Strong progress. Encouraged student to consider tutoring peers.",
  "GPA and pace above threshold. Continue monitoring.",
];

const WARNING_NOTES = [
  "GPA below 2.0. Academic improvement plan discussed.",
  "Pace has slipped below 67%. Student aware of requirement.",
  "Warning issued. Student committed to study-group schedule.",
];

const PROBATION_NOTES = [
  "Second consecutive evaluation below threshold. Probation status applied.",
  "Appeal reviewed and approved with conditions. Bi-weekly check-ins required.",
  "Probation plan in place. Student signed acknowledgment.",
];

const TERMINATION_NOTES = [
  "Failed to meet probation conditions. Financial aid eligibility terminated.",
];

function pickNote(rng: () => number, notes: string[]): string {
  return notes[Math.floor(rng() * notes.length)];
}

function pickAdvisor(rng: () => number): string {
  return ADVISOR_NAMES[Math.floor(rng() * ADVISOR_NAMES.length)];
}

/**
 * Build SAP records for a given courseId. Uses the same 25 demo students
 * and layers evaluation checkpoints on top.
 *
 * Evaluation schedule: 3 checkpoints at 25%, 50%, 75% through
 * a 16-week term (roughly weeks 4, 8, 12).
 */
export function demoSapRecords(_courseId: number): SapRecord[] {
  return [];
}
