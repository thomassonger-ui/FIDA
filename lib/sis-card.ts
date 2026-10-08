import { getServerClient } from "@/lib/supabase";
import { photoUrl } from "@/lib/sis-photo";

export const SCHOOL_NAME = "Florida Institute of Dental Assisting";

/** Everything the ID card needs for one students row. */
export async function idCardData(s: Record<string, unknown>) {
  let validThrough: string | null = null;
  if (s.cohort_id) {
    try {
      const { data } = await getServerClient()
        .from("demo_cohorts")
        .select("end_date")
        .eq("id", s.cohort_id as string)
        .maybeSingle();
      validThrough = (data?.end_date as string) ?? null;
    } catch {
      /* cohorts table optional */
    }
  }
  if (!validThrough && typeof s.start_date === "string") {
    const d = new Date(s.start_date);
    d.setFullYear(d.getFullYear() + 1);
    validThrough = d.toISOString().slice(0, 10);
  }
  const name =
    `${(s.first_name as string) ?? ""} ${(s.last_name as string) ?? ""}`.trim() ||
    ((s.full_name as string) ?? "") ||
    ((s.email as string) ?? "");
  return {
    school: SCHOOL_NAME,
    photoUrl: await photoUrl(s.photo_ref),
    name,
    preferredName: (s.preferred_name as string) || null,
    studentNumber: (s.student_number as string) || null,
    program: (s.program as string) || null,
    cohort: (s.cohort_id as string) || null,
    validThrough,
  };
}
