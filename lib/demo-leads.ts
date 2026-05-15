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
  const rng = prng(20260415); // fixed seed tied to date
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const leads: DemoLead[] = [];
  for (let i = 0; i < 50; i++) {
    const first = pick(FIRST, rng);
    const last = pick(LAST, rng);
    const program = pick(PROGRAMS, rng);
    const timeline = pick(TIMELINES, rng);

    // Handoff time: spread across last 30 days, weighted toward recent.
    const daysAgo = Math.floor(rng() * rng() * 30);
    const handedOff = new Date(now - daysAgo * day - rng() * day);
    // Created 10-45 min before handoff (length of Atticus chat).
    const created = new Date(
      handedOff.getTime() - (10 + rng() * 35) * 60 * 1000
    );

    const messageCount = 6 + Math.floor(rng() * 24);
    const flagged = rng() < 0.12 ? 1 : 0;
    const hasPhone = rng() > 0.15;
    const hasEmail = rng() > 0.05;

    leads.push({
      id: `demo-${i.toString().padStart(3, "0")}`,
      created_at: created.toISOString(),
      last_activity_at: handedOff.toISOString(),
      handed_off_at: handedOff.toISOString(),
      lead_name: `${first} ${last}`,
      lead_email: hasEmail
        ? `${first}.${last}`.toLowerCase() + "@gmail.com"
        : null,
      lead_phone: hasPhone
        ? `(407) ${200 + Math.floor(rng() * 799)}-${1000 + Math.floor(rng() * 8999)}`
        : null,
      program_interest: program,
      lead_timeline: timeline,
      message_count: messageCount,
      flagged_count: flagged,
    });
  }
  // Most recent first.
  leads.sort(
    (a, b) =>
      new Date(b.handed_off_at ?? 0).getTime() -
      new Date(a.handed_off_at ?? 0).getTime()
  );
  return leads;
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
export function demoTranscript(lead: DemoLead): DemoMessage[] {
  const idx = parseInt(lead.id.replace("demo-", ""), 10) || 0;
  const rng = prng(20260415 + idx * 97);
  const startMs = new Date(lead.created_at).getTime();
  const first = lead.lead_name?.split(" ")[0] ?? "there";
  const program = lead.program_interest ?? "allied health";
  const timeline = lead.lead_timeline ?? "Next cohort";

  // Each entry is one Q/A turn. We'll emit user then assistant messages.
  const turns: { user: string; atticus: string }[] = [
    {
      user: `Hi, I'm interested in the ${program} program. Can you tell me more?`,
      atticus: `Hey ${first}! Great to meet you. The ${program} program at Blueprint School is a 16-week certificate track — you'll finish with the credential and clinical hours you need to sit for the national exam. Can I ask what got you looking into it?`,
    },
    {
      user: `I've been working retail for a few years and I want something with more stability. A friend did medical billing and liked it.`,
      atticus: `That's a really common path — we see a lot of students making the same move. The job market for ${program} graduates in Orlando is strong right now. What's your timeline looking like?`,
    },
    {
      user: timeline.toLowerCase().includes("asap")
        ? "Honestly I'd start tomorrow if I could."
        : timeline.toLowerCase().includes("researching")
        ? "Just researching for now, trying to figure out if this is the right fit."
        : `I was thinking ${timeline.toLowerCase()}.`,
      atticus: `Got it. Our next cohort starts in about 3 weeks — applications are open through next Friday. Would it help to walk through cost and financial aid, or would you rather see the class schedule first?`,
    },
    {
      user: `Cost is probably the biggest question for me, yeah.`,
      atticus: `Totally fair. Tuition for ${program} is $4,950 all-in — that covers your textbooks, scrubs, and the exam voucher. We have a monthly payment plan, and most students qualify for either WIOA workforce funding or our in-house scholarship for first-time allied health students. I can have an advisor run the numbers for you. Do you have your email handy so we can send over the breakdown?`,
    },
    {
      user: lead.lead_email
        ? `Sure, it's ${lead.lead_email}.`
        : `I'd rather not share email yet, can you just tell me a range?`,
      atticus: lead.lead_email
        ? `Perfect, I've got it. What's the best phone number to reach you on?`
        : `Of course. Most students pay between $0 and $2,400 out of pocket after aid — the rest is covered. When you're ready to see the personalized number, an advisor can put it together in about 10 minutes.`,
    },
  ];

  // Inject a flagged turn for ~12% of demo leads.
  const flagged = (lead.flagged_count ?? 0) > 0;
  const flagPool = [
    { msg: "I lost my job last month and I don't really know how I'm going to pay for this, but I need to do something.", reason: "Financial distress" },
    { msg: "I just turned 17. My mom says I can sign up. Can I start before I'm 18?", reason: "Minor / age concern" },
    { msg: "Does the program run a background check? I have a misdemeanor from ten years ago.", reason: "Background check concern" },
    { msg: "I've been in a really dark place the last few months. Getting into school would give me something to focus on.", reason: "Mental health disclosure" },
    { msg: "Can you just sign me up now? I'll figure out the paperwork later.", reason: "Bypass attempt" },
  ];
  let flagInsert: { msg: string; reason: string } | null = null;
  if (flagged) {
    flagInsert = flagPool[Math.floor(rng() * flagPool.length)];
  }

  const messages: DemoMessage[] = [];
  let t = startMs;
  let nextId = 1;
  for (let i = 0; i < turns.length; i++) {
    t += 20_000 + Math.floor(rng() * 60_000); // 20-80s between turns
    messages.push({
      id: nextId++,
      role: "user",
      content: turns[i].user,
      created_at: new Date(t).toISOString(),
      flagged: false,
      flag_reason: null,
    });
    t += 4_000 + Math.floor(rng() * 8_000); // Atticus replies in 4-12s
    messages.push({
      id: nextId++,
      role: "assistant",
      content: turns[i].atticus,
      created_at: new Date(t).toISOString(),
      flagged: false,
      flag_reason: null,
    });
  }

  // Splice a flagged user message near the end so reviewers see it in context.
  if (flagInsert) {
    t += 15_000;
    messages.splice(messages.length - 2, 0, {
      id: nextId++,
      role: "user",
      content: flagInsert.msg,
      created_at: new Date(t).toISOString(),
      flagged: true,
      flag_reason: flagInsert.reason,
    });
    t += 6_000;
    messages.splice(messages.length - 2, 0, {
      id: nextId++,
      role: "assistant",
      content: `Thank you for sharing that, ${first}. I want to make sure we get you connected with someone who can talk through this properly rather than me trying to handle it in chat. I'm going to have a human advisor reach out today — is the number ending in ${(lead.lead_phone ?? "").slice(-4) || "xxxx"} still the best way?`,
      created_at: new Date(t).toISOString(),
      flagged: false,
      flag_reason: null,
    });
  }

  // Closing handoff turn.
  t += 12_000;
  messages.push({
    id: nextId++,
    role: "assistant",
    content: `Thanks ${first}! I've passed your info to one of our admissions advisors — they'll reach out within one business day with next steps. In the meantime, if anything else comes up, just reply here.`,
    created_at: new Date(t).toISOString(),
    flagged: false,
    flag_reason: null,
  });

  return messages;
}
