/**
 * Deterministic demo intervention records.
 *
 * "No student falls through the cracks" — the promise on the marketing site.
 * This is the workflow that delivers it:
 *
 *   1. Atticus flags a risk signal (attendance, grade, stale login)
 *   2. A retention advisor is auto-assigned from the roster
 *   3. Outreach, meeting, and support plan are logged as timeline events
 *   4. The intervention resolves (student back on track), stays in-progress,
 *      or escalates to the program director
 *
 * Derived from demoStudents() so numbers line up with every other page.
 * No Supabase — pure demo. Safe to refresh without shuffling data.
 */

import { demoStudents, type DemoStudent } from "@/lib/demo-students";
import { getTrackedCourses } from "@/lib/moodle";

export type InterventionStatus =
  | "open" // flagged, no staff contact yet
  | "assigned" // staff assigned, outreach pending
  | "in_progress" // meeting held, plan in motion
  | "resolved" // student back on track
  | "escalated"; // handed up to program director

export type InterventionSeverity = "medium" | "high" | "critical";

export type InterventionTriggerKind =
  | "attendance" // attendance dropped below threshold
  | "grade" // grade dropped below threshold
  | "stale_login" // no LMS login in N days
  | "missed_assessments"; // multiple missed assessments in a window

export type TimelineEventKind =
  | "risk_flagged"
  | "staff_assigned"
  | "outreach_attempted"
  | "meeting_booked"
  | "plan_drafted"
  | "followup_logged"
  | "resolved"
  | "escalated";

export type TimelineEvent = {
  id: string;
  kind: TimelineEventKind;
  at: string; // ISO
  actor: string; // "Atticus" or staff name
  title: string;
  detail: string;
};

export type Intervention = {
  id: string; // iv-{courseId}-{studentIdx}
  courseId: number;
  cohortName: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  // Snapshot of the student signals at time of flag
  attendancePct: number;
  gradePct: number;
  lastAccessDaysAgo: number;
  // Workflow state
  status: InterventionStatus;
  severity: InterventionSeverity;
  trigger: {
    kind: InterventionTriggerKind;
    label: string; // "Attendance 79% · 2 missed assessments in 10 days"
  };
  assignedTo: string; // retention advisor name
  flaggedAt: string; // ISO
  lastActivityAt: string; // ISO
  timeline: TimelineEvent[];
};

/** Retention advisors (the humans that interventions route to). */
export const RETENTION_ADVISORS = [
  "D. Harper",
  "M. Alvarez",
  "J. Okonkwo",
  "S. Park",
];

export const PROGRAM_DIRECTOR = "Dr. L. Coleman";

/** Mulberry32 — stable across refreshes. */
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

function severityFromStudent(s: DemoStudent): InterventionSeverity {
  // Combine worst of the two signals.
  if (s.attendancePct < 60 || s.gradePct < 55) return "critical";
  if (s.attendancePct < 70 || s.gradePct < 65) return "high";
  return "medium";
}

function triggerFromStudent(
  s: DemoStudent,
  daysSinceLogin: number
): Intervention["trigger"] {
  // Pick whichever signal is most dramatic.
  const attendanceGap = 75 - s.attendancePct; // positive = below threshold
  const gradeGap = 70 - s.gradePct;
  const loginGap = daysSinceLogin - 10;
  const worst = Math.max(attendanceGap, gradeGap, loginGap);

  if (worst === gradeGap && gradeGap > 0) {
    return {
      kind: "grade",
      label: `Grade ${s.gradePct}% · below 70% threshold`,
    };
  }
  if (worst === loginGap && loginGap > 0) {
    return {
      kind: "stale_login",
      label: `No LMS login in ${daysSinceLogin} days`,
    };
  }
  // Attendance story is more compelling when we can pair it with missed work.
  const missed = Math.max(1, Math.round((75 - s.attendancePct) / 10));
  return {
    kind: "missed_assessments",
    label: `Attendance ${s.attendancePct}% · ${missed} missed assessment${
      missed === 1 ? "" : "s"
    } in 10 days`,
  };
}

function statusDistribution(rng: () => number): InterventionStatus {
  // 30% open/assigned, 40% in_progress, 25% resolved, 5% escalated.
  const r = rng();
  if (r < 0.15) return "open";
  if (r < 0.30) return "assigned";
  if (r < 0.70) return "in_progress";
  if (r < 0.95) return "resolved";
  return "escalated";
}

function fmt(d: Date): string {
  return d.toISOString();
}

function buildTimeline(
  iv: Omit<Intervention, "timeline" | "lastActivityAt">,
  student: DemoStudent,
  rng: () => number
): { timeline: TimelineEvent[]; lastActivityAt: string } {
  const flagged = new Date(iv.flaggedAt);
  const events: TimelineEvent[] = [];
  let cursor = flagged.getTime();
  const min = 60 * 1000;

  // Always: risk flagged.
  events.push({
    id: `${iv.id}-1`,
    kind: "risk_flagged",
    at: fmt(new Date(cursor)),
    actor: "Atticus",
    title: "Risk flag",
    detail: `${student.firstname.charAt(0)}. ${student.lastname} — ${iv.trigger.label}.`,
  });

  // Always: staff assigned (same minute).
  cursor += Math.floor(rng() * 3) * min;
  events.push({
    id: `${iv.id}-2`,
    kind: "staff_assigned",
    at: fmt(new Date(cursor)),
    actor: "Atticus",
    title: "Staff assigned",
    detail: `Auto-escalated to ${iv.assignedTo} (retention advisor). Context + history attached.`,
  });

  if (iv.status === "open") {
    return { timeline: events, lastActivityAt: events[events.length - 1].at };
  }

  // assigned → outreach attempted
  cursor += (30 + Math.floor(rng() * 90)) * min; // 30–120 min
  events.push({
    id: `${iv.id}-3`,
    kind: "outreach_attempted",
    at: fmt(new Date(cursor)),
    actor: iv.assignedTo,
    title: "Outreach attempted",
    detail: `Phone + email sent. Reviewing attendance trend and assessment log.`,
  });

  if (iv.status === "assigned") {
    return { timeline: events, lastActivityAt: events[events.length - 1].at };
  }

  // in_progress → meeting + plan
  cursor += (60 + Math.floor(rng() * 120)) * min;
  events.push({
    id: `${iv.id}-4`,
    kind: "meeting_booked",
    at: fmt(new Date(cursor)),
    actor: iv.assignedTo,
    title: "Meeting booked",
    detail: `15-minute check-in scheduled. Student confirmed — obstacle is ${
      rng() < 0.5 ? "childcare during clinical block" : "work schedule conflict"
    }.`,
  });

  cursor += (20 + Math.floor(rng() * 60)) * min;
  events.push({
    id: `${iv.id}-5`,
    kind: "plan_drafted",
    at: fmt(new Date(cursor)),
    actor: iv.assignedTo,
    title: "Support plan drafted",
    detail: `Catch-up schedule agreed. Tutoring slot assigned Tues/Thurs. Attendance check-ins weekly.`,
  });

  if (iv.status === "in_progress") {
    cursor += (120 + Math.floor(rng() * 480)) * min;
    events.push({
      id: `${iv.id}-6`,
      kind: "followup_logged",
      at: fmt(new Date(cursor)),
      actor: iv.assignedTo,
      title: "Follow-up logged",
      detail: `Attended tutoring. Attendance trending up. Next check-in in 7 days.`,
    });
    return { timeline: events, lastActivityAt: events[events.length - 1].at };
  }

  // resolved
  if (iv.status === "resolved") {
    cursor += (300 + Math.floor(rng() * 600)) * min;
    events.push({
      id: `${iv.id}-6`,
      kind: "followup_logged",
      at: fmt(new Date(cursor)),
      actor: iv.assignedTo,
      title: "Follow-up logged",
      detail: `Attendance recovered to 88%. Last two assessments passed. Student back on pace.`,
    });
    cursor += (60 + Math.floor(rng() * 240)) * min;
    events.push({
      id: `${iv.id}-7`,
      kind: "resolved",
      at: fmt(new Date(cursor)),
      actor: iv.assignedTo,
      title: "Resolved",
      detail: `Closed. Student on track for completion. Monitoring continues via passive signals.`,
    });
    return { timeline: events, lastActivityAt: events[events.length - 1].at };
  }

  // escalated
  cursor += (300 + Math.floor(rng() * 400)) * min;
  events.push({
    id: `${iv.id}-6`,
    kind: "followup_logged",
    at: fmt(new Date(cursor)),
    actor: iv.assignedTo,
    title: "Follow-up logged",
    detail: `Two outreach attempts this week with no response. Student missed scheduled meeting.`,
  });
  cursor += (60 + Math.floor(rng() * 180)) * min;
  events.push({
    id: `${iv.id}-7`,
    kind: "escalated",
    at: fmt(new Date(cursor)),
    actor: iv.assignedTo,
    title: "Escalated",
    detail: `Handed up to ${PROGRAM_DIRECTOR}. Recommended academic probation review.`,
  });
  return { timeline: events, lastActivityAt: events[events.length - 1].at };
}

function interventionForStudent(
  student: DemoStudent,
  courseId: number,
  cohortName: string,
  idx: number
): Intervention {
  // Per-intervention RNG so numbers are stable across refreshes.
  const rng = prng(courseId * 73856093 + student.id * 19349663);
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const daysSinceLogin = Math.round((now / 1000 - student.lastaccess) / 86400);

  const severity = severityFromStudent(student);
  const trigger = triggerFromStudent(student, daysSinceLogin);
  const status = statusDistribution(rng);
  const assignedTo = RETENTION_ADVISORS[idx % RETENTION_ADVISORS.length];

  // Flagged 1–18 days ago, weighted toward recent.
  const daysAgo = 1 + Math.floor(rng() * rng() * 18);
  const flaggedAt = new Date(
    now - daysAgo * day - Math.floor(rng() * day)
  ).toISOString();

  const id = `iv-${courseId}-${Math.abs(student.id)}`;

  const skeleton: Omit<Intervention, "timeline" | "lastActivityAt"> = {
    id,
    courseId,
    cohortName,
    studentId: student.id,
    studentName: student.fullname,
    studentEmail: student.email,
    attendancePct: student.attendancePct,
    gradePct: student.gradePct,
    lastAccessDaysAgo: daysSinceLogin,
    status,
    severity,
    trigger,
    assignedTo,
    flaggedAt,
  };

  const { timeline, lastActivityAt } = buildTimeline(skeleton, student, rng);
  return { ...skeleton, timeline, lastActivityAt };
}

/** Every active + recently-resolved intervention across every tracked cohort. */
export async function allInterventions(): Promise<Intervention[]> {
  const tracked = await getTrackedCourses();
  const out: Intervention[] = [];
  let i = 0;
  for (const c of tracked) {
    const cohortName = c.shortname ?? c.fullname ?? `Course ${c.course_id}`;
    const students = demoStudents(c.course_id);
    // Every risk-tier student gets an intervention. One of the watch-tier
    // students per cohort also gets a monitoring intervention so there are
    // more active cases than just the at-risk three.
    const risks = students.filter((s) => s.riskTier === "risk");
    const watchSample = students.filter((s) => s.riskTier === "watch").slice(0, 1);
    for (const s of [...risks, ...watchSample]) {
      out.push(interventionForStudent(s, c.course_id, cohortName, i++));
    }
  }
  // Newest activity first.
  out.sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
  );
  return out;
}

/** Fetch one intervention by ID (detail page). */
export async function getIntervention(id: string): Promise<Intervention | null> {
  const all = await allInterventions();
  return all.find((iv) => iv.id === id) ?? null;
}

export function severityTone(
  sev: InterventionSeverity
): "ok" | "warn" | "risk" {
  return sev === "medium" ? "warn" : "risk";
}

export function statusLabel(status: InterventionStatus): string {
  return {
    open: "Open",
    assigned: "Assigned",
    in_progress: "In progress",
    resolved: "Resolved",
    escalated: "Escalated",
  }[status];
}

export function statusTone(
  status: InterventionStatus
): "ok" | "warn" | "risk" | "neutral" {
  switch (status) {
    case "open":
      return "risk";
    case "assigned":
      return "warn";
    case "in_progress":
      return "warn";
    case "resolved":
      return "ok";
    case "escalated":
      return "risk";
  }
}
