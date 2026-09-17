/**
 * CE course enrolment links — the ONE place these live.
 *
 * The buying sequence, in the order a student actually experiences it:
 *
 *   1. ENROLL  — create a Moodle account      -> CE_SIGNUP
 *   2. PAYPAL  — pay for the specific course  -> CE_ENROLL[course]
 *   3. STUDY   — start immediately
 *
 * Why the main CTA goes to SIGNUP and not straight to the enrolment page:
 * Moodle cannot show a pay button to a visitor with no account, because a paid
 * seat has to attach to a user record. A logged-out visitor sent to
 * enrol/index.php gets the bare "Welcome back" login screen — no course name,
 * no price, no PayPal — with "Sign up" as small grey text at the bottom. That
 * reads as a dead end to a first-time buyer, so new people go to signup and
 * step 1 becomes explicit.
 *
 * Verified 2026-09-17, logged out: enrol/index.php returns the byte-identical
 * login page as course/view.php. It does NOT display the course or the fee.
 * (An earlier version of this comment claimed otherwise. It was wrong.)
 *
 * Returning students use CE_ENROLL directly — after login it lands them on that
 * course's payment page.
 *
 * Course IDs (Professional Development category, ongoing/open enrolment — NOT
 * the Summer 2026 cohorts 21/22, which run out with their current students):
 *   23 = Radiography for Dental Personnel    (RDP-CE,  $499)
 *   24 = Expanded Functions Dental Assisting (EFDA-CE, $1,049)
 */

const MOODLE = "https://fldentalassisting.moodlecloud.com";

/** Step 1 — create the Moodle account. Where the main CTA points. */
export const CE_SIGNUP = `${MOODLE}/login/signup.php`;

/** Step 2 — pay for one specific course. For students who already have an account. */
export const CE_ENROLL = {
  radiography: `${MOODLE}/enrol/index.php?id=23`,
  efda: `${MOODLE}/enrol/index.php?id=24`,
} as const;

/** Storefront of all CE courses — used where we aren't pointing at one course. */
export const CE_STOREFRONT = `${MOODLE}/`;
