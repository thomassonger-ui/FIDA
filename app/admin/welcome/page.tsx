import { WelcomeScreen } from "@/components/WelcomeScreen";
import { safeNext } from "@/lib/safe-next";
import { getServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Same count as the sidebar Tickets badge: tickets needing staff attention. */
async function adminTaskCount(): Promise<number> {
  try {
    const supabase = getServerClient();
    const { count, error } = await supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "awaiting_staff"]);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminWelcome({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const tasks = await adminTaskCount();
  return (
    <WelcomeScreen
      eyebrow="Florida Institute of Dental Assisting"
      tasks={tasks}
      next={safeNext(next, "/admin", "/admin/leads")}
      cta="Enter Dashboard"
      news={{
        text: "Ask Atticus finds any record in seconds, and builds a cited audit binder with a gap report.",
        href: "/admin/ask",
        label: "Try it",
      }}
    />
  );
}
