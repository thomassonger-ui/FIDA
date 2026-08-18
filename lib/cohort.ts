import type { Bilingual } from "@/lib/i18n/LanguageProvider";

/**
 * SINGLE SOURCE OF TRUTH for the Entry Level Dental Assisting cohort date.
 *
 * This date previously drifted across three i18n files (home.ts, pages.ts,
 * atticus.ts) and the Atticus system prompt — at one point the site showed
 * three different dates at once. Every surface now imports from here, so a
 * confirmed date from Debbie & Ashley is a one-line change.
 *
 * STATUS: September 14, 2026 — pending final confirmation.
 *
 * NOTE: applies to the DIPLOMA PROGRAM ONLY. The EFDA and Radiography
 * Professional Development courses are open enrollment (start anytime) and
 * must never display a fixed start date.
 */
export const COHORT_DATE_EN = "September 14, 2026";
export const COHORT_DATE_ES = "14 de septiembre de 2026";

export const COHORT_DATE: Bilingual = {
  en: COHORT_DATE_EN,
  es: COHORT_DATE_ES,
};
