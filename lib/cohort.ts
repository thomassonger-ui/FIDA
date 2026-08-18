import type { Bilingual } from "@/lib/i18n/LanguageProvider";

/**
 * SINGLE SOURCE OF TRUTH for the Entry Level Dental Assisting cohort.
 *
 * CONFIRMED by Debbie & Ashley (via Tom, 2026-08-18): the Fall cohort start
 * was postponed from Aug 25 to September 15, 2026 to fill more seats.
 * Classes meet Tuesdays & Thursdays, 9:00 AM–1:30 PM.
 *
 * Every surface (homepage, about, tuition, program page, Atticus prompt +
 * tiles) imports from here — a date change is a one-line edit.
 *
 * NOTE: applies to the DIPLOMA PROGRAM ONLY. The EFDA and Radiography
 * Professional Development courses are open enrollment (start anytime) and
 * must never display a fixed start date.
 */
export const COHORT_DATE_EN = "September 15, 2026";
export const COHORT_DATE_ES = "15 de septiembre de 2026";

export const COHORT_DATE: Bilingual = {
  en: COHORT_DATE_EN,
  es: COHORT_DATE_ES,
};

export const COHORT_SCHEDULE_EN = "Tuesdays & Thursdays, 9:00 AM–1:30 PM";
export const COHORT_SCHEDULE_ES = "Martes y jueves, 9:00 AM–1:30 PM";

export const COHORT_SCHEDULE: Bilingual = {
  en: COHORT_SCHEDULE_EN,
  es: COHORT_SCHEDULE_ES,
};
