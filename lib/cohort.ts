import type { Bilingual } from "@/lib/i18n/LanguageProvider";

/**
 * SINGLE SOURCE OF TRUTH for Entry Level Dental Assisting cohorts.
 *
 * CONFIRMED by Ashley (via Tom, 2026-08-25): three upcoming classes.
 *   1. Tue/Thu day class — Sept 15, 2026 (postponed from Aug 25 on 08-18)
 *   2. Mon/Wed evening class — Nov 9, 2026
 *   3. All-day Friday class — Jan 22, 2027
 *
 * Every surface (homepage, about, tuition, programs, program page, Atticus
 * prompt + tiles) imports from here. To add / retire a cohort edit COHORTS
 * only. The legacy COHORT_DATE / COHORT_SCHEDULE exports always resolve to
 * the FIRST entry (the next start), so single-date surfaces stay correct.
 *
 * NOTE: applies to the DIPLOMA PROGRAM ONLY. The EFDA and Radiography
 * Professional Development courses are open enrollment (start anytime) and
 * must never display a fixed start date.
 */
export type Cohort = {
  /** Short label, e.g. "Tue/Thu day class" */
  label: Bilingual;
  /** Start date, long form */
  date: Bilingual;
  /** Meeting days + hours */
  schedule: Bilingual;
};

export const COHORTS: Cohort[] = [
  {
    label: { en: "Tue/Thu day class", es: "Clase diurna martes/jueves" },
    date: { en: "September 15, 2026", es: "15 de septiembre de 2026" },
    schedule: {
      en: "Tuesdays & Thursdays, 9:00 AM–1:30 PM",
      es: "Martes y jueves, 9:00 AM–1:30 PM",
    },
  },
  {
    label: { en: "Mon/Wed evening class", es: "Clase vespertina lunes/miércoles" },
    date: { en: "November 9, 2026", es: "9 de noviembre de 2026" },
    schedule: {
      en: "Mondays & Wednesdays, 5:00–9:30 PM",
      es: "Lunes y miércoles, 5:00–9:30 PM",
    },
  },
  {
    label: { en: "Friday all-day class", es: "Clase de viernes (día completo)" },
    date: { en: "January 22, 2027", es: "22 de enero de 2027" },
    schedule: {
      en: "Fridays, 9:00 AM–4:30 PM",
      es: "Viernes, 9:00 AM–4:30 PM",
    },
  },
];

/* ---- Legacy single-cohort exports (= the next start) ---- */
const NEXT = COHORTS[0];

export const COHORT_DATE_EN = NEXT.date.en;
export const COHORT_DATE_ES = NEXT.date.es;
export const COHORT_DATE: Bilingual = NEXT.date;

export const COHORT_SCHEDULE_EN = NEXT.schedule.en;
export const COHORT_SCHEDULE_ES = NEXT.schedule.es;
export const COHORT_SCHEDULE: Bilingual = NEXT.schedule;

/* ---- Plain-text summary of every upcoming class (Atticus prompt, meta) ---- */
export const COHORTS_SUMMARY_EN = COHORTS.map(
  (c) => `${c.label.en}: starts ${c.date.en}, ${c.schedule.en}`,
).join("; ");
export const COHORTS_SUMMARY_ES = COHORTS.map(
  (c) => `${c.label.es}: comienza el ${c.date.es}, ${c.schedule.es}`,
).join("; ");
