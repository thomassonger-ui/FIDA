/**
 * Deterministic financial ledger demo data.
 *
 * Generates tuition charges, payment records, and running balances
 * for each demo student. Includes a few students with partial
 * payments and one withdrawal scenario to demonstrate R2T4.
 *
 * Demo-only. In production the financial ledger belongs in a
 * third-party system (Regent, CampusNexus, PopuliFinancial) with
 * Apex SIS reading summary views. Don\u2019t roll your own ledger math.
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

export function demoLedger(courseId: number): StudentLedger[] {
  const students = demoStudents(courseId);
  const rng = prng(courseId * 577215 + 141421);

  const termStart = "2026-01-12";

  return students.map((stu, idx) => {
    const entries: LedgerEntry[] = [];
    let entryIdx = 0;

    // Everyone gets a tuition charge + reg fee on term start
    entries.push({
      id: `led-${stu.id}-${entryIdx++}`,
      date: termStart,
      kind: "registration_fee",
      description: "Registration fee \u2014 Spring 2026",
      amount: REG_FEE,
    });
    entries.push({
      id: `led-${stu.id}-${entryIdx++}`,
      date: termStart,
      kind: "tuition_charge",
      description: "Tuition \u2014 Medical Assisting, Spring 2026",
      amount: TUITION,
    });

    const totalCharges = TUITION + REG_FEE;
    let credits = 0;

    // Financial aid — most students get some
    const aidPct = stu.riskTier === "risk" ? 0.4 + rng() * 0.3 : 0.5 + rng() * 0.45;
    const aidAmount = Math.round(TUITION * aidPct / 100) * 100; // round to $100
    if (aidAmount > 0) {
      entries.push({
        id: `led-${stu.id}-${entryIdx++}`,
        date: "2026-01-15",
        kind: "financial_aid",
        description: "Federal Pell Grant disbursement",
        amount: -aidAmount,
      });
      credits += aidAmount;
    }

    // Cash payment — some students pay more
    const cashPct = 0.1 + rng() * 0.5;
    const remaining = totalCharges - credits;
    const cashPaid = Math.round((remaining * cashPct) / 50) * 50; // round to $50
    if (cashPaid > 0) {
      entries.push({
        id: `led-${stu.id}-${entryIdx++}`,
        date: "2026-01-20",
        kind: "payment",
        description: "Student payment \u2014 check",
        amount: -cashPaid,
      });
      credits += cashPaid;
    }

    // Second payment for on-track students
    if (stu.riskTier === "ok" && rng() > 0.4) {
      const secondPay = Math.round((remaining - cashPaid) * (0.3 + rng() * 0.7) / 50) * 50;
      if (secondPay > 0) {
        entries.push({
          id: `led-${stu.id}-${entryIdx++}`,
          date: "2026-02-15",
          kind: "payment",
          description: "Student payment \u2014 online",
          amount: -secondPay,
        });
        credits += secondPay;
      }
    }

    // R2T4 scenario: first at-risk student withdraws
    let hasR2T4 = false;
    let withdrawalDate: string | null = null;
    if (stu.riskTier === "risk" && idx === 0) {
      withdrawalDate = "2026-03-01";
      hasR2T4 = true;
      // R2T4 return — school must return unearned Title IV funds
      const r2t4Amount = Math.round(aidAmount * 0.42); // ~42% unearned
      if (r2t4Amount > 0) {
        entries.push({
          id: `led-${stu.id}-${entryIdx++}`,
          date: "2026-03-10",
          kind: "r2t4_return",
          description: "Return to Title IV \u2014 42% unearned portion",
          amount: r2t4Amount, // charge back to student (positive)
        });
        credits -= r2t4Amount; // reduces net credits
      }
    }

    const balance = totalCharges - credits;

    return {
      student: stu,
      tuitionTotal: totalCharges,
      paidTotal: credits,
      balance: Math.max(0, balance),
      aidAwarded: aidAmount,
      entries: entries.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      hasR2T4,
      withdrawalDate,
    };
  });
}
