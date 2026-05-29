import Link from "next/link";
import { getServerClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Atticus module mapping
//
// Each admin route maps to one Atticus module (or null for the dashboard).
// The tag is shown as a small pill on the right side of the nav item so the
// owner can see at a glance which billed module powers each page.
//
// Tier 02 (Operational) modules:
//   ENROLL — AtticusEnroll   (lead capture, tickets, Atticus chat)
//   OS     — AtticusOS       (students, cohorts, attendance, ledger)
//   CE     — AtticusCE       (SAP, interventions, Title IV compliance)
//   WP     — AtticusWP       (graduate placement verification)
//   LLS    — AtticusLLS      (licensing lifecycle, state+fed deadlines)
//   LMS    — AtticusLMS      (Moodle integration, documents, training)
//   M      — Atticus™M (à la carte add-on, not part of Operational tier)
// ---------------------------------------------------------------------------

type ModuleTag = "ENROLL" | "OS" | "CE" | "WP" | "LLS" | "LMS" | "M";

type NavItem = {
  href: string;
  label: string;
  tag?: ModuleTag;
  hidden?: boolean;
};

const nav: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tickets", label: "Messages", tag: "ENROLL" },
  { href: "/admin/leads", label: "Leads", tag: "ENROLL" },
  { href: "/admin/students", label: "Students", tag: "OS" },
  { href: "/admin/cohorts", label: "Cohorts", tag: "OS" },
  { href: "/admin/attendance", label: "Attendance", tag: "OS" },
  { href: "/admin/interventions", label: "Interventions", tag: "CE" },
  { href: "/admin/sap", label: "SAP", tag: "CE" },
  { href: "/admin/ledger", label: "Ledger", tag: "OS", hidden: true },
  { href: "/admin/placement", label: "Placement", tag: "WP", hidden: true },
  { href: "/admin/documents", label: "Documents", tag: "LMS" },
  { href: "/admin/compliance", label: "Compliance", tag: "LLS" },
  { href: "/admin/moodle", label: "Moodle", tag: "LMS" },
  { href: "/admin/atticusm", label: "Atticus™M", tag: "M" },
  { href: "/admin/it-tickets", label: "Tickets to IT" },
];

function tagClass(tag: ModuleTag): string {
  switch (tag) {
    case "ENROLL":
      return "bg-teal/10 text-teal-deep border-teal/30";
    case "OS":
      return "bg-navy-50 text-navy border-navy-100";
    case "CE":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "WP":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "LLS":
      return "bg-rose-50 text-rose-800 border-rose-200";
    case "LMS":
      return "bg-violet-50 text-violet-800 border-violet-200";
    case "M":
      return "bg-paper text-subtle border-rule italic";
    default:
      return "bg-paper-subtle text-muted border-rule";
  }
}

/** Count tickets needing staff attention. Returns 0 if the table doesn't exist yet. */
async function openTicketCount(): Promise<number> {
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

export async function Sidebar() {
  const openTickets = await openTicketCount();

  return (
    <aside className="w-60 shrink-0 border-r border-rule bg-paper-subtle min-h-screen p-6 flex flex-col">
      {/* LOGO */}
      <Link href="/" className="block mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fida-shield.png" alt="FIDA" className="w-8 h-8 object-contain mb-2" />
        <div className="font-display text-lg text-ink">FIDA</div>
        <div className="eyebrow">Admin</div>
      </Link>

      {/* SUBSCRIPTION PILL */}
      <Link
        href="/admin/subscription"
        className="block mb-6 border border-teal/40 bg-teal/5 rounded-sm px-3 py-2 hover:bg-teal/10 transition-colors"
      >
        <div className="eyebrow text-teal-deep">Atticus Operational</div>
        <div className="text-xs text-ink mt-0.5">6 modules active</div>
        <div className="text-[10px] text-subtle mt-1">View subscription →</div>
      </Link>

      {/* NAV */}
      <nav className="space-y-0.5">
        {nav
          .filter((item) => !item.hidden)
          .map((item) => {
            const isTickets = item.href === "/admin/tickets";
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-muted hover:text-ink hover:bg-paper rounded-sm transition-colors"
              >
                <span className="truncate">{item.label}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {isTickets && openTickets > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-semibold rounded-full bg-teal text-white">
                      {openTickets > 99 ? "99+" : openTickets}
                    </span>
                  )}
                  {item.tag && (
                    <span
                      className={`inline-block text-[9px] font-semibold uppercase tracking-wider border px-1 py-0 rounded-sm ${tagClass(
                        item.tag
                      )}`}
                      title={
                        item.tag === "M"
                          ? "Atticus™M (à la carte add-on)"
                          : `Atticus${item.tag === "ENROLL" ? "Enroll" : item.tag === "OS" ? "OS" : item.tag === "CE" ? "CE" : item.tag === "WP" ? "WP" : item.tag === "LLS" ? "LLS" : "LMS"}`
                      }
                    >
                      {item.tag}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
      </nav>

      {/* LEGEND */}
      <div className="mt-6 pt-4 border-t border-rule">
        <div className="eyebrow text-muted mb-2">Module key</div>
        <div className="space-y-1 text-[10px] text-subtle leading-tight">
          <div>
            <span className={`inline-block border px-1 rounded-sm font-semibold tracking-wider mr-1.5 ${tagClass("ENROLL")}`}>ENROLL</span>
            Lead capture &amp; chat
          </div>
          <div>
            <span className={`inline-block border px-1 rounded-sm font-semibold tracking-wider mr-1.5 ${tagClass("OS")}`}>OS</span>
            Operations
          </div>
          <div>
            <span className={`inline-block border px-1 rounded-sm font-semibold tracking-wider mr-1.5 ${tagClass("CE")}`}>CE</span>
            SAP &amp; compliance
          </div>
          <div>
            <span className={`inline-block border px-1 rounded-sm font-semibold tracking-wider mr-1.5 ${tagClass("WP")}`}>WP</span>
            Placement
          </div>
          <div>
            <span className={`inline-block border px-1 rounded-sm font-semibold tracking-wider mr-1.5 ${tagClass("LLS")}`}>LLS</span>
            Licensing lifecycle
          </div>
          <div>
            <span className={`inline-block border px-1 rounded-sm font-semibold tracking-wider mr-1.5 ${tagClass("LMS")}`}>LMS</span>
            Training &amp; docs
          </div>
          <div>
            <span className={`inline-block border px-1 rounded-sm font-semibold tracking-wider mr-1.5 ${tagClass("M")}`}>M</span>
            Marketing (add-on)
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-6 border-t border-rule space-y-3">
        <Link href="/" className="block text-xs text-subtle hover:text-ink">
          &larr; Back to public site
        </Link>
        <form action="/api/admin/logout" method="post">
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
