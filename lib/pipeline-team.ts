/**
 * Who the pipeline's VA-call briefings and memos can go to. Shared by the
 * board (checkboxes) and the API routes (address lookup — the browser only
 * sends keys, never addresses).
 */
export const PIPELINE_TEAM = [
  { key: "tom", name: "Tom Songer", email: "tom@tryatticus.com", defaultOn: true },
  { key: "debbie", name: "Debbie Sanders", email: "debbiesanders@fldentalassisting.com", defaultOn: false },
  { key: "ashley", name: "Ashley Sanders", email: "success@fldentalassisting.com", defaultOn: false },
  { key: "jessa", name: "Jessa Villadares", email: "jessa@tryatticus.com", defaultOn: false },
  { key: "angley", name: "Dr. Angley", email: "jangley@colemiddleton.com", defaultOn: false },
] as const;

export type TeamKey = (typeof PIPELINE_TEAM)[number]["key"];

export function teamMember(key: string) {
  return PIPELINE_TEAM.find((m) => m.key === key) ?? null;
}

/** Outcomes a VA can record after a call — same list as the Atticus console. */
export const CALL_OUTCOMES = [
  "Booked on Calendly",
  "Callback set",
  "Left voicemail",
  "No answer",
  "Wants info by email",
  "Not interested",
  "Wrong number",
] as const;
