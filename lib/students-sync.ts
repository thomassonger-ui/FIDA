/**
 * Moodle → Supabase student sync.
 *
 * Pulls every enrolled student from every tracked Moodle course and upserts
 * them into public.students. Anyone present in Moodle becomes status='active'.
 * Anyone with a moodle_user_id who is no longer enrolled anywhere becomes
 * status='withdrawn' (row, docs, history all preserved).
 *
 * Called on every load of /admin/students. Cheap because the underlying
 * Moodle pulls are cached for 3 minutes by lib/moodle.ts.
 */

import { getServerClient } from "@/lib/supabase";
import {
  getTrackedCourses,
  getEnrolledUsers,
  classifyEnrollee,
  type EnrolledUser,
  type TrackedCourse,
} from "@/lib/moodle";

type Cohort = { courseId: number; shortname: string; fullname: string };
type SeenStudent = {
  moodleUserId: number;
  email: string;
  fullName: string;
  cohorts: Cohort[];
};

function deriveProgram(
  shortnames: string[]
): "efda" | "rdp_ce" | "both" | "other" | null {
  const s = shortnames.map((x) => x.toLowerCase()).join(" ");
  const isEfda = /efda/.test(s);
  const isRdp = /rdp/.test(s);
  if (isEfda && isRdp) return "both";
  if (isEfda) return "efda";
  if (isRdp) return "rdp_ce";
  return shortnames.length ? "other" : null;
}

export type SyncResult = {
  added: number;
  updated: number;
  withdrawn: number;
  scanned: number;
  errors: string[];
};

export async function syncMoodleStudents(): Promise<SyncResult> {
  const result: SyncResult = {
    added: 0,
    updated: 0,
    withdrawn: 0,
    scanned: 0,
    errors: [],
  };
  const supabase = getServerClient();

  let tracked: TrackedCourse[];
  try {
    tracked = await getTrackedCourses();
  } catch (e) {
    result.errors.push(
      `getTrackedCourses: ${e instanceof Error ? e.message : String(e)}`
    );
    return result;
  }
  if (tracked.length === 0) return result;

  // Gather: one entry per Moodle user, accumulating every course they're in.
  const seen = new Map<number, SeenStudent>();
  for (const c of tracked) {
    let enrolled: EnrolledUser[];
    try {
      enrolled = await getEnrolledUsers(c.course_id);
    } catch (e) {
      result.errors.push(
        `course ${c.course_id} enroll: ${e instanceof Error ? e.message : String(e)}`
      );
      continue;
    }
    for (const u of enrolled) {
      if (classifyEnrollee(u) !== "student") continue;
      const email = (u.email || "").trim().toLowerCase();
      if (!email) continue;
      const cohort: Cohort = {
        courseId: c.course_id,
        shortname: c.shortname || c.fullname || `course-${c.course_id}`,
        fullname: c.fullname || c.shortname || `course-${c.course_id}`,
      };
      const existing = seen.get(u.id);
      if (existing) {
        existing.cohorts.push(cohort);
      } else {
        seen.set(u.id, {
          moodleUserId: u.id,
          email,
          fullName: u.fullname,
          cohorts: [cohort],
        });
      }
    }
  }
  result.scanned = seen.size;

  const nowIso = new Date().toISOString();

  for (const s of seen.values()) {
    const shortnames = s.cohorts.map((c) => c.shortname).sort();
    const cohortLabel = shortnames.join(", ");
    const program = deriveProgram(shortnames);
    const primaryCourseId = [...s.cohorts].sort(
      (a, b) => a.courseId - b.courseId
    )[0].courseId;

    const baseFields = {
      moodle_user_id: s.moodleUserId,
      moodle_course_id: primaryCourseId,
      email: s.email,
      full_name: s.fullName,
      cohort_id: cohortLabel,
      program,
      status: "active",
      source: "moodle",
      last_synced_at: nowIso,
      withdrawn_at: null as string | null,
      updated_at: nowIso,
    };

    // Match by moodle_user_id first.
    const { data: existingByMoodle, error: lookupErr } = await supabase
      .from("students")
      .select("id")
      .eq("moodle_user_id", s.moodleUserId)
      .maybeSingle();
    if (lookupErr) {
      result.errors.push(`lookup ${s.moodleUserId}: ${lookupErr.message}`);
      continue;
    }
    if (existingByMoodle) {
      const { error: updErr } = await supabase
        .from("students")
        .update(baseFields)
        .eq("id", existingByMoodle.id);
      if (updErr) result.errors.push(`update ${s.email}: ${updErr.message}`);
      else result.updated++;
      continue;
    }

    // Fallback: adopt any existing manual row with the same email.
    const { data: existingByEmail, error: emailErr } = await supabase
      .from("students")
      .select("id")
      .ilike("email", s.email)
      .maybeSingle();
    if (emailErr) {
      result.errors.push(`email lookup ${s.email}: ${emailErr.message}`);
      continue;
    }
    if (existingByEmail) {
      const { error: adoptErr } = await supabase
        .from("students")
        .update(baseFields)
        .eq("id", existingByEmail.id);
      if (adoptErr) result.errors.push(`adopt ${s.email}: ${adoptErr.message}`);
      else result.updated++;
      continue;
    }

    // New row.
    const { error: insErr } = await supabase.from("students").insert({
      ...baseFields,
      created_at: nowIso,
    });
    if (insErr) result.errors.push(`insert ${s.email}: ${insErr.message}`);
    else result.added++;
  }

  // Withdraw any Supabase row with a moodle_user_id we did NOT see this run.
  const seenIds = Array.from(seen.keys());
  let staleQ = supabase
    .from("students")
    .select("id")
    .not("moodle_user_id", "is", null)
    .neq("status", "withdrawn");
  if (seenIds.length > 0) {
    staleQ = staleQ.not("moodle_user_id", "in", `(${seenIds.join(",")})`);
  }
  const { data: stale, error: staleErr } = await staleQ;
  if (staleErr) {
    result.errors.push(`stale fetch: ${staleErr.message}`);
  } else if (stale && stale.length > 0) {
    const ids = stale.map((r) => r.id as string);
    const { error: wErr } = await supabase
      .from("students")
      .update({
        status: "withdrawn",
        withdrawn_at: nowIso,
        last_synced_at: nowIso,
        updated_at: nowIso,
      })
      .in("id", ids);
    if (wErr) result.errors.push(`withdraw: ${wErr.message}`);
    else result.withdrawn = ids.length;
  }

  return result;
}
