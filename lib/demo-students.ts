/**
 * Cohort roster — live from Moodle, role-aware.
 *
 * File name preserved as `demo-students.ts` for import-stability across the
 * admin codebase. Despite the name, this is no longer demo data — every row
 * comes from a live Moodle call filtered to pure students (staff excluded).
 */

import { getCohortStudents, type CohortStudent } from "@/lib/moodle";

/** Shape that the admin pages expect. Re-export of CohortStudent. */
export type DemoStudent = CohortStudent;

/**
 * Async — replaces the deterministic ghost roster with a live Moodle pull.
 * Returns pure students (managers/teachers excluded). Empty array if the
 * Moodle call fails or the course has no enrolled students.
 */
export async function demoStudents(courseId: number): Promise<DemoStudent[]> {
    try {
          return await getCohortStudents(courseId);
    } catch {
          return [];
    }
}

/**
 * Given a desired attendance % and total sessions, return session counts.
 * Used by the per-cohort attendance breakdown UI when no mod_attendance data
 * exists yet (pre-launch state). Kept as-is from the demo-era code.
 */
export function breakdownFromPct(
    attendancePct: number,
    totalSessions: number
  ): { present: number; late: number; excused: number; absent: number } {
    if (totalSessions === 0) {
          return { present: 0, late: 0, excused: 0, absent: 0 };
    }
    const attended = Math.round((attendancePct / 100) * totalSessions);
    const absent = Math.max(0, totalSessions - attended);
    const late = Math.min(attended, Math.round(attended * 0.08));
    const present = attended - late;
    const excused = 0;
    return { present, late, excused, absent };
}
