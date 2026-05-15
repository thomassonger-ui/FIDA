/**
 * Deterministic demo leads for /admin/leads.
 *
 * Simulates Atticus intake conversations that handed off to a human advisor
 * in the last 30 days. Shown when the real atticus_sessions table is empty
 * or unreachable so the demo always has a populated pipeline.
 */

export type DemoLead = {
  id: string;
  created_at: string;
  last_activity_at: string | null;
  handed_off_at: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  program_interest: string | null;
  lead_timeline: string | null;
  message_count: number | null;
  flagged_count: number | null;
};

const FIRST = [
  "Emma", "Michael", "Olivia", "James", "Ava",
  "Benjamin", "Sophia", "Elijah", "Isabella", "Lucas",
  "Mia", "Henry", "Charlotte", "Alexander", "Amelia",
  "Daniel", "Harper", "Matthew", "Evelyn", "Jackson",
  "Abigail", "Sebastian", "Emily", "Gabriel", "Ella",
  "Owen", "Scarlett", "Aiden", "Grace", "Carter",
];

const LAST = [
  "Smith", "Johnson", "Williams", "Brown", "Davis",
  "Miller", "Wilson", "Moore", "Taylor", "Anderson",
  "Thomas", "Jackson", "White", "Harris", "Martin",
  "Thompson", "Garcia", "Martinez", "Robinson", "Clark",
  "Rodriguez", "Lewis", "Lee", "Walker", "Hall",
  "Allen", "Young", "King", "Wright", "Lopez",
];

const PROGRAMS = [
  "Certified Clinical Medical Assistant",
  "Phlebotomy Technician",
  "Medical Billing & Coding",
  "Pharmacy Technician",
  "EKG Technician",
];

const TIMELINES = [
  "Start ASAP",
  "Next cohort (1-3 months)",
  "Later this year",
  "Just researching",
];

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

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** 50 deterministic leads spread across the last 30 days. */
export function demoLeads(): DemoLead[] {
  // Demo data disabled. Restore from git history (or wire to Supabase) for real leads.
  return [];
}

export type DemoMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  flagged: boolean;
  flag_reason: string | null;
};

/** Match the /^demo-\d{3}$/ pattern emitted by demoLeads(). */
export function isDemoLeadId(id: string): boolean {
  return /^demo-\d{3}$/.test(id);
}

/**
 * Build a plausible Atticus transcript for a specific demo lead. Keyed off
 * the same index so refreshing the page returns the same transcript.
 */
export function demoTranscript(_lead: DemoLead): DemoMessage[] {
  return [];
}
