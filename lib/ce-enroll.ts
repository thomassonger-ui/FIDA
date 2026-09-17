/**
 * CE course enrolment links — the ONE place these live.
 *
 * Each CE course points at its own Moodle *enrolment* page, not the Moodle
 * front page. The enrolment page is where the PayPal button appears once the
 * student has an account, so this is the shortest honest path from the site to
 * a paid seat.
 *
 * Why enrol/index.php and not course/view.php: a logged-out visitor sent to
 * course/view.php is bounced to a bare login screen with no course name and no
 * price. The enrolment page states the course and the fee, so the login step
 * reads as part of buying rather than a dead end.
 *
 * Course IDs (Professional Development category, ongoing/open-enrolment
 * versions created 2026-09-17 — NOT the Summer 2026 cohorts 21/22, which are
 * left to run out with their current students):
 *   23 = Radiography for Dental Personnel   (RDP-CE,  $499)
 *   24 = Expanded Functions Dental Assisting (EFDA-CE, $1,049)
 */

const MOODLE = "https://fldentalassisting.moodlecloud.com";

export const CE_ENROLL = {
  radiography: `${MOODLE}/enrol/index.php?id=23`,
  efda: `${MOODLE}/enrol/index.php?id=24`,
} as const;

/** Storefront of all CE courses — used where we aren't pointing at one course. */
export const CE_STOREFRONT = `${MOODLE}/`;
