/**
 * Maps the cohort a student picks on /enroll to the "Program Information"
 * lines on the CIE enrollment agreement (class time, days, hours, anticipated
 * end date). Shared by the signing page, the validator and the PDF.
 *
 * Source of truth for cohorts is lib/cohort.ts; this file only translates.
 */

import { COHORTS } from "@/lib/cohort";
import { PROGRAM } from "@/lib/enrollment-agreement-text";

export type ClassTime = "MORNING" | "EVENING" | "FRIDAY ONLY";
export type ClassDays = "M/W pm" | "T/TH am" | "F";

export type ScheduleInfo = {
  /** The option string the student saw, e.g. "September 15, 2026 — Tue/Thu day class (Tuesdays & Thursdays, 9:00 AM–1:30 PM)" */
  option: string;
  start_date: string;        // "September 15, 2026"
  anticipated_end: string;   // start + 7½ months, same format
  class_time: ClassTime;
  days: ClassDays;
  begins: string;            // "9:00 AM"
  ends: string;              // "1:30 PM"
};

export function cohortOptions(): string[] {
  return COHORTS.map((c) => `${c.date.en} — ${c.label.en} (${c.schedule.en})`);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parseLongDate(s: string): Date | null {
  const m = s.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[1]);
  if (mi < 0) return null;
  return new Date(+m[3], mi, +m[2]);
}

function fmtLong(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** PROGRAM.length is "7 1/2 months" → 7 months + 15 days. */
function addProgramLength(d: Date): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + 7);
  out.setDate(out.getDate() + 15);
  return out;
}

function hours(schedule: string): { begins: string; ends: string } {
  const m = schedule.match(/(\d{1,2}(?::\d{2})?)\s*(AM|PM)?\s*[–-]\s*(\d{1,2}(?::\d{2})?)\s*(AM|PM)/i);
  if (!m) return { begins: "", ends: "" };
  const endAmPm = m[4].toUpperCase();
  const beginAmPm = (m[2] || endAmPm).toUpperCase();
  const norm = (t: string) => (t.includes(":") ? t : `${t}:00`);
  return { begins: `${norm(m[1])} ${beginAmPm}`, ends: `${norm(m[3])} ${endAmPm}` };
}

/** Resolve a cohort option string (as shown on the form) to schedule facts. Null if it isn't a current cohort. */
export function scheduleFor(option: string): ScheduleInfo | null {
  const idx = cohortOptions().indexOf(option);
  if (idx < 0) return null;
  const c = COHORTS[idx];
  const label = c.label.en.toLowerCase();
  const sched = c.schedule.en;
  let class_time: ClassTime;
  let days: ClassDays;
  if (label.includes("friday")) { class_time = "FRIDAY ONLY"; days = "F"; }
  else if (label.includes("evening")) { class_time = "EVENING"; days = "M/W pm"; }
  else { class_time = "MORNING"; days = "T/TH am"; }
  const start = parseLongDate(c.date.en);
  const { begins, ends } = hours(sched);
  return {
    option,
    start_date: c.date.en,
    anticipated_end: start ? fmtLong(addProgramLength(start)) : `approx. ${PROGRAM.length} after start`,
    class_time,
    days,
    begins,
    ends,
  };
}
