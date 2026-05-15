/**
 * Demo cohort + KPI helpers.
 *
 * These are derived from the tracked courses table + deterministic ghost
 * students, so every dashboard shows consistent numbers without needing
 * Supabase seed tables. Swap to real tables whenever they exist.
 */

import { getTrackedCourses, type TrackedCourse } from "@/lib/moodle";
import { demoStudents } from "@/lib/demo-students";

export type DemoCohort = {
  id: number;
  courseId: number;
  shortname: string;
  fullname: string;
  studentCount: number;
  atRiskCount: number;
  avgAttendance: number;
  avgGrade: number;
  startDate: string; // ISO date
};

export type OverviewKpis = {
  studentsEnrolled: number;
  activeCohorts: number;
  placement90Day: number | null; // percent of recent grads placed
  complianceFlags: number;
  avgGrade: number | null;
  avgAttendance: number | null;
  atRiskCount: number;
};

/** Build a cohort summary for every tracked course. */
export async function getDemoCohorts(): Promise<DemoCohort[]> {
  const tracked = await getTrackedCourses();
  return tracked.map((c) => cohortFromTracked(c));
}

function cohortFromTracked(c: TrackedCourse): DemoCohort {
  const students = demoStudents(c.course_id);
  const n = students.length;
  const avgAttendance = n
    ? students.reduce((s, r) => s + r.attendancePct, 0) / n
    : 0;
  const avgGrade = n
    ? students.reduce((s, r) => s + r.gradePct, 0) / n
    : 0;
  const atRiskCount = students.filter((s) => s.riskTier === "risk").length;
  // Start 16 weeks ago, matching the attendance session count.
  const start = new Date();
  start.setDate(start.getDate() - 16 * 7);
  return {
    id: c.course_id,
    courseId: c.course_id,
    shortname: c.shortname ?? "",
    fullname: c.fullname ?? "",
    studentCount: students.length,
    atRiskCount,
    avgAttendance,
    avgGrade,
    startDate: start.toISOString().slice(0, 10),
  };
}

/** Roll-up KPIs across every tracked cohort. */
export async function getOverviewKpis(): Promise<OverviewKpis> {
  const cohorts = await getDemoCohorts();
  if (cohorts.length === 0) {
    return {
      studentsEnrolled: 0,
      activeCohorts: 0,
      placement90Day: null,
      complianceFlags: 0,
      avgGrade: null,
      avgAttendance: null,
      atRiskCount: 0,
    };
  }
  const studentsEnrolled = cohorts.reduce((s, c) => s + c.studentCount, 0);
  const atRiskCount = cohorts.reduce((s, c) => s + c.atRiskCount, 0);
  const avgGrade =
    cohorts.reduce((s, c) => s + c.avgGrade, 0) / cohorts.length;
  const avgAttendance =
    cohorts.reduce((s, c) => s + c.avgAttendance, 0) / cohorts.length;
  // Stable demo placement % — allied-health schools commonly report 75-90%.
  const placement90Day = 82;
  // Compliance flags = at-risk students + a small fixed baseline for
  // expiring certifications (BLS, HIPAA) so the card is never empty.
  const complianceFlags = atRiskCount + Math.max(2, Math.round(studentsEnrolled * 0.04));
  return {
    studentsEnrolled,
    activeCohorts: cohorts.length,
    placement90Day,
    complianceFlags,
    avgGrade,
    avgAttendance,
    atRiskCount,
  };
}
