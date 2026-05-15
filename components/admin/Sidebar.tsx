import Link from "next/link";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/cohorts", label: "Cohorts" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/interventions", label: "Interventions" },
  { href: "/admin/sap", label: "SAP" },
  { href: "/admin/ledger", label: "Ledger" },
  { href: "/admin/placement", label: "Placement" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/compliance", label: "Compliance" },
  { href: "/admin/moodle", label: "Moodle" },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-rule bg-paper-subtle min-h-screen p-6 flex flex-col">
      <Link href="/" className="block mb-10">
        <div className="font-display text-lg text-ink">FIDA</div>
        <div className="eyebrow">Admin</div>
      </Link>
      <nav className="space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 text-sm text-muted hover:text-ink hover:bg-paper rounded-sm transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
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
