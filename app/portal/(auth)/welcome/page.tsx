import { redirect } from "next/navigation";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { safeNext } from "@/lib/safe-next";
import { getPortalStudent } from "@/lib/portal-auth";
import { listTicketsByEmail } from "@/lib/tickets-db";

export const dynamic = "force-dynamic";

export default async function PortalWelcome({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const student = await getPortalStudent();
  if (!student) redirect("/portal/login");

  const { next } = await searchParams;
  // Tasks = support tickets waiting on the student's reply.
  let tasks = 0;
  try {
    const tickets = await listTicketsByEmail(student.email);
    tasks = tickets.filter((t) => t.status === "awaiting_student").length;
  } catch {
    tasks = 0;
  }
  const firstName = student.full_name?.trim().split(/\s+/)[0] ?? null;

  return (
    <WelcomeScreen
      eyebrow="FIDA Student Portal"
      firstName={firstName}
      tasks={tasks}
      next={safeNext(next, "/portal", "/portal")}
      cta="Enter Portal"
    />
  );
}
