/**
 * Deterministic demo student roster.
 *
 * Real Moodle has ~2 users on this cloud, which isn't compelling for a
 * school-owner demo. These ghosts fill in the roster so the dashboard shows
 * what a real allied-health cohort of ~27 students looks like. They never
 * hit Moodle — IDs are negative to avoid any collision with real user IDs.
 *
 * Distribution is deterministic per course:
 *   15 on-track (90–100% attendance, 85–98% grade)
 *    7 watch    (75–89% attendance, 72–84% grade)
 *    3 at-risk  (45–74% attendance, 40–68% grade)
 */

const FIRST_NAMES = [
  "Sarah", "Marcus", "Priya", "Jamal", "Elena",
  "Luis", "Chloe", "Andre", "Mia", "Diego",
  "Kenji", "Amara", "Noah", "Zara", "Ethan",
  "Leila", "Tariq", "Isabel", "Devon", "Yuki",
  "Carlos", "Nadia", "Ezekiel", "Simone", "Rafael",
];

const LAST_NAMES = [
  "Chen", "Johnson", "Patel", "Washington", "Rodriguez",
  "Vasquez", "Nguyen", "Thomas", "Goldberg", "Okafor",
  "Tanaka", "Bello", "Reyes", "Hassan", "Park",
  "Ahmadi", "Ibrahim", "Martinez", "Brooks", "Kim",
  "Diaz", "Khan", "Williams", "Laurent", "Santos",
];

export type DemoStudent = {
  id: number; // negative — never collides with Moodle IDs
  fullname: string;
  firstname: string;
  lastname: string;
  email: string;
  riskTier: "ok" | "watch" | "risk";
  /** attendance: 0–100, stable per (courseId, student) */
  attendancePct: number;
  /** final course grade 0–100 */
  gradePct: number;
  /** fraction of activities completed, 0–100 */
  completionPct: number;
  /** Last login — unix seconds, recent for healthy, older for at-risk */
  lastaccess: number;
};

/** Tiny seeded PRNG (mulberry32). */
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

/**
 * 25 demo students for a given course. Deterministic per courseId so the
 * same faces + numbers appear every page load.
 */
export function demoStudents(courseId: number): DemoStudent[] {
  const rng = prng(courseId * 1013904223 + 1664525);
  const now = Math.floor(Date.now() / 1000);
  const day = 60 * 60 * 24;

  // Fixed distribution: 3 at-risk, 7 watch, 15 on-track.
  const tiers: ("risk" | "watch" | "ok")[] = [
    ...Array(3).fill("risk"),
    ...Array(7).fill("watch"),
    ...Array(15).fill("ok"),
  ];

  const out: DemoStudent[] = [];
  for (let i = 0; i < 25; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7 + 3) % LAST_NAMES.length];
    const fullname = `${first} ${last}`;
    const email = `${first}.${last}`.toLowerCase() + "@blueprint.edu";
    const tier = tiers[i];

    let attendancePct: number;
    let gradePct: number;
    let completionPct: number;
    let lastaccess: number;
    if (tier === "risk") {
      attendancePct = Math.round(between(rng, 45, 74));
      gradePct = Math.round(between(rng, 40, 68));
      completionPct = Math.round(between(rng, 10, 45));
      lastaccess = now - Math.floor(between(rng, 10 * day, 35 * day));
    } else if (tier === "watch") {
      attendancePct = Math.round(between(rng, 75, 89));
      gradePct = Math.round(between(rng, 72, 84));
      completionPct = Math.round(between(rng, 45, 75));
      lastaccess = now - Math.floor(between(rng, 2 * day, 9 * day));
    } else {
      attendancePct = Math.round(between(rng, 90, 100));
      gradePct = Math.round(between(rng, 85, 98));
      completionPct = Math.round(between(rng, 75, 100));
      lastaccess = now - Math.floor(between(rng, 0, 2 * day));
    }

    out.push({
      id: -(1000 + i + courseId * 100), // negative, deterministic, unique
      fullname,
      firstname: first,
      lastname: last,
      email,
      riskTier: tier,
      attendancePct,
      gradePct,
      completionPct,
      lastaccess,
    });
  }
  return out;
}

/** Given a desired attendance % and total sessions, return session counts. */
export function breakdownFromPct(
  attendancePct: number,
  totalSessions: number
): { present: number; late: number; excused: number; absent: number } {
  if (totalSessions === 0) {
    return { present: 0, late: 0, excused: 0, absent: 0 };
  }
  const attended = Math.round((attendancePct / 100) * totalSessions);
  const absent = Math.max(0, totalSessions - attended);
  // Split "attended" into present vs late with a small ratio of late.
  const late = Math.min(attended, Math.round(attended * 0.08));
  const present = attended - late;
  const excused = 0;
  return { present, late, excused, absent };
}
