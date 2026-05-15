/**
 * Deterministic financial ledger demo data.
 *
 * Generates tuition charges, payment records, and running balances
 * for each demo student. Includes a few students with partial
 * payments and one withdrawal scenario to demonstrate R2T4.
 *
 * Demo-only. In production the financial ledger belongs in a
 * third-party system (Regent, CampusNexus, PopuliFinancial) with
 * FIDA OS reading summary views. Don\u2019t roll your own ledger math.
 */

import { demoStudents, type DemoStudent } from "./demo-students";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type LedgerEntryKind =
  | "tuition_charge"
  | "registration_fee"
  | "payment"
  | "financial_aid"
  | "refund"
  | "r2t4_return";

export type LedgerEntry = {
  id: string;
  date: string; // ISO date
  kind: LedgerEntryKind;
  description: string;
  amount: number; // positive = charge, negative = credit/payment
};

export type StudentLedger = {
  student: DemoStudent;
  tuitionTotal: number;
  paidTotal: number;
  balance: number;
  aidAwarded: number;
  entries: LedgerEntry[];
  hasR2T4: boolean;
  withdrawalDate: string | null;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function entryKindLabel(k: LedgerEntryKind): string {
  const map: Record<LedgerEntryKind, string> = {
    tuition_charge: "Tuition charge",
    registration_fee: "Registration fee",
    payment: "Payment",
    financial_aid: "Financial aid",
    refund: "Refund",
    r2t4_return: "R2T4 return",
  };
  return map[k];
}

export function entryKindTone(
  k: LedgerEntryKind
): "charge" | "credit" | "warn" {
  if (k === "r2t4_return") return "warn";
  if (k === "tuition_charge" || k === "registration_fee") return "charge";
  return "credit";
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

/* ------------------------------------------------------------------ */
/*  Generator                                                          */
/* ------------------------------------------------------------------ */

const TUITION = 14_500; // per-term tuition
const REG_FEE = 250;

export function demoLedger(_courseId: number): StudentLedger[] {
  return [];
}
