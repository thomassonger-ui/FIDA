import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getServerClient } from "@/lib/supabase";
import { resolvePortalStudent } from "@/lib/students-db";

async function unreadTicketCount(email: string): Promise<number> {
  try {
    const supabase = getServerClient();
    const { count, error } = await supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .ilike("email", email)
      .in("status", ["awaiting_student"]);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function PortalSidebar() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options: CookieOptions }[]) => {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const student = user?.email
    ? await resolvePortalStudent({ userId: user.id, email: user.email })
    : null;
  const unread = user?.email ? await unreadTicketCount(user.email) : 0;

  return (
    <aside className="w-60 shrink-0 border-r border-rule bg-paper-subtle min-h-screen p-6 flex flex-col">
      <Link href="/portal" className="block mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fida-shield.png" alt="FIDA" className="w-8 h-8 object-contain mb-2" />
        <div className="font-display text-lg text-ink">FIDA</div>
        <div className="eyebrow">Student Portal</div>
      </Link>

      {student && (
        <div className="mb-6 text-xs">
          <div className="text-ink font-medium">{student.full_name || user?.email}</div>
          <div className="text-subtle truncate">{student.email}</div>
        </div>
      )}

      <nav className="space-y-1">
        <SidebarLink href="/portal" label="Overview" />
        <SidebarLink href="/portal/tickets" label="Messages" badge={unread} />
        <SidebarLink href="/portal/documents" label="Documents" />
        <SidebarLink href="/portal/profile" label="Profile" />
      </nav>

      <div className="mt-auto pt-6 border-t border-rule space-y-3">
        <Link href="/" className="block text-xs text-subtle hover:text-ink">
          ← FIDA website
        </Link>
        <form action="/api/portal/logout" method="post">
          <button
            type="submit"
            className="text-xs text-subtle hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarLink({ href, label, badge }: { href: string; label: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 text-sm text-muted hover:text-ink hover:bg-paper rounded-sm transition-colors"
    >
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold rounded-full bg-teal text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
