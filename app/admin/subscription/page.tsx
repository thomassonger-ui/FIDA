import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Subscription · Admin · FIDA",
};

// ---------------------------------------------------------------------------
// Tier 02 — Operational
// Single source of truth for "what FIDA is paying for and what powers it."
// Update this file if pricing, modules, or admin-page mappings change.
// ---------------------------------------------------------------------------

type Module = {
  code: "ENROLL" | "OS" | "CE" | "WP" | "LLS" | "LMS" | "M";
  name: string;
  tagline: string;
  description: string;
  powers: { label: string; href: string; status: "live" | "hidden" | "planned" }[];
  included: boolean; // true = part of Operational; false = add-on
  status: "active" | "ready" | "coming_soon";
};

const MODULES: Module[] = [
  {
    code: "ENROLL",
    name: "AtticusEnroll",
    tagline: "Everything in Tier 1",
    description:
      "Lead capture and ticketing.",
    powers: [
      { label: "Leads", href: "/admin/leads", status: "live" },
      { label: "Tickets", href: "/admin/tickets", status: "live" },
    ],
    included: true,
    status: "active",
  },
  {
    code: "CE",
    name: "AtticusCE",
    tagline: "SAP monitoring, Title IV compliance, audit preparation",
    description:
      "Satisfactory Academic Progress tracking, intervention workflows, and the documentation trail accreditors and Title IV auditors look for.",
    powers: [
      { label: "SAP", href: "/admin/sap", status: "live" },
      { label: "Interventions", href: "/admin/interventions", status: "live" },
    ],
    included: true,
    status: "active",
  },
  {
    code: "WP",
    name: "AtticusWP",
    tagline: "Graduate placement verification",
    description:
      "Capture and verify post-graduation employment outcomes — the data accreditors require and that drives BPPE/ABHES placement reporting.",
    powers: [{ label: "Placement", href: "/admin/placement", status: "hidden" }],
    included: true,
    status: "ready",
  },
  {
    code: "OS",
    name: "AtticusOS",
    tagline: "Enrollment management, retention, staff, financial operations",
    description:
      "The operating system for the school — student rosters, cohort scheduling, attendance, staff, and the financial ledger.",
    powers: [
      { label: "Students", href: "/admin/students", status: "live" },
      { label: "Cohorts", href: "/admin/cohorts", status: "live" },
      { label: "Attendance", href: "/admin/attendance", status: "live" },
      { label: "Ledger", href: "/admin/ledger", status: "hidden" },
    ],
    included: true,
    status: "active",
  },
  {
    code: "LLS",
    name: "AtticusLLS",
    tagline: "Licensing lifecycle — state & federal deadline tracking",
    description:
      "FL Board of Dentistry renewal calendar, state and federal compliance deadlines, and the paper trail that goes with them.",
    powers: [{ label: "Compliance", href: "/admin/compliance", status: "live" }],
    included: true,
    status: "active",
  },
  {
    code: "LMS",
    name: "AtticusLMS",
    tagline: "Staff and student training, certifications, compliance courses",
    description:
      "Moodle-backed learning management for student coursework, plus staff certifications and required compliance training.",
    powers: [
      { label: "Moodle", href: "/admin/moodle", status: "live" },
      { label: "Documents", href: "/admin/documents", status: "live" },
    ],
    included: true,
    status: "active",
  },
  {
    code: "M",
    name: "Atticus™M",
    tagline: "Acquisition engine (à la carte add-on)",
    description:
      "Market analysis, campaign templates, QR attribution, and AI-generated outreach copy. Not part of Tier 02 — billed separately.",
    powers: [{ label: "Atticus™M", href: "/admin/atticusm", status: "live" }],
    included: false,
    status: "active",
  },
];

function statusBadge(status: Module["status"]) {
  switch (status) {
    case "active":
      return (
        <span className="bg-teal/10 text-teal-deep border border-teal/30 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm">
          Active
        </span>
      );
    case "ready":
      return (
        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm">
          Ready — flip to enable
        </span>
      );
    case "coming_soon":
      return (
        <span className="bg-paper-subtle text-subtle border border-rule text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm">
          Coming soon
        </span>
      );
  }
}

function powerStatusDot(status: "live" | "hidden" | "planned") {
  switch (status) {
    case "live":
      return <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal mr-2" />;
    case "hidden":
      return <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" />;
    case "planned":
      return <span className="inline-block w-1.5 h-1.5 rounded-full bg-paper-subtle border border-rule mr-2" />;
  }
}

export default function SubscriptionPage() {
  const includedModules = MODULES.filter((m) => m.included);
  const addons = MODULES.filter((m) => !m.included);

  // FIDA pricing inputs (kept inline; edit here if seat count or rate changes)
  const STUDENTS = 50;
  const RATE_PER_STUDENT = 25; // $/month
  const MONTHLY = STUDENTS * RATE_PER_STUDENT;
  const ANNUAL = MONTHLY * 12;

  return (
    <div className="max-w-5xl">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="eyebrow">Subscription</span>
        <span className="text-xs text-subtle">· Tier 02 — Operational</span>
      </div>
      <h1 className="font-display text-4xl text-ink tracking-tight">Your subscription</h1>
      <p className="text-sm text-muted mt-2 max-w-2xl leading-snug">
        Everything FIDA is paying for under Atticus Operational — what each module does,
        which admin pages it powers, and what it would cost to replace with Populi + a
        separate LMS.
      </p>

      {/* PRICING CARD */}
      <section className="mt-8 border border-rule rounded-sm bg-paper p-6 md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <div className="eyebrow text-teal-deep">Tier 02 · Operational</div>
          <div className="font-display text-4xl text-ink mt-1 leading-none">
            ${RATE_PER_STUDENT}{" "}
            <span className="text-base text-muted font-display">per student / month</span>
          </div>
          <div className="text-sm text-muted mt-2">
            {STUDENTS} students = <span className="font-semibold text-ink">${MONTHLY.toLocaleString()} / month</span>{" "}
            (${ANNUAL.toLocaleString()} / year)
          </div>
        </div>
        <div className="mt-4 md:mt-0 md:text-right text-sm text-muted">
          <div className="text-xs text-subtle">Replaces</div>
          <div className="text-ink font-semibold">Populi + a separate LMS</div>
          <div className="text-xs text-subtle mt-1">~$1,100–$1,500 / month combined</div>
        </div>
      </section>

      {/* MODULES INCLUDED */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-ink">
            Modules included ({includedModules.length})
          </h2>
          <div className="text-xs text-subtle">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal mr-1.5 align-middle" />
            Live page
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-3 mr-1.5 align-middle" />
            Hidden in sidebar (flip to enable)
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {includedModules.map((m) => (
            <div key={m.code} className="border border-rule rounded-sm bg-paper p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block text-[10px] uppercase tracking-wider font-semibold border px-1.5 py-0.5 rounded-sm bg-teal/10 text-teal-deep border-teal/30">
                    {m.code}
                  </span>
                  <h3 className="font-display text-lg text-ink leading-none">{m.name}</h3>
                </div>
                {statusBadge(m.status)}
              </div>
              <p className="text-xs text-teal-deep font-semibold">{m.tagline}</p>
              <p className="text-sm text-muted mt-2 leading-snug">{m.description}</p>
              <div className="mt-4 pt-3 border-t border-rule">
                <div className="eyebrow text-subtle mb-2">Powers these pages</div>
                <ul className="space-y-1">
                  {m.powers.map((p) => (
                    <li key={p.href} className="flex items-center text-sm">
                      {powerStatusDot(p.status)}
                      {p.status === "live" ? (
                        <Link href={p.href} className="text-ink hover:text-teal-deep underline decoration-dotted">
                          {p.label}
                        </Link>
                      ) : (
                        <span className="text-subtle italic">
                          {p.label} <span className="text-[10px]">({p.status})</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADD-ONS */}
      {addons.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl text-ink mb-3">À la carte add-ons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addons.map((m) => (
              <div key={m.code} className="border border-rule rounded-sm bg-paper-subtle p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block text-[10px] uppercase tracking-wider font-semibold border px-1.5 py-0.5 rounded-sm bg-paper text-subtle border-rule italic">
                      {m.code}
                    </span>
                    <h3 className="font-display text-lg text-ink leading-none">{m.name}</h3>
                  </div>
                  {statusBadge(m.status)}
                </div>
                <p className="text-xs text-teal-deep font-semibold">{m.tagline}</p>
                <p className="text-sm text-muted mt-2 leading-snug">{m.description}</p>
                <div className="mt-4 pt-3 border-t border-rule">
                  <div className="eyebrow text-subtle mb-2">Powers</div>
                  <ul className="space-y-1">
                    {m.powers.map((p) => (
                      <li key={p.href} className="flex items-center text-sm">
                        {powerStatusDot(p.status)}
                        <Link href={p.href} className="text-ink hover:text-teal-deep underline decoration-dotted">
                          {p.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMPARISON CALLOUT */}
      <section className="mt-10 border-l-4 border-teal bg-teal-50 rounded-sm px-5 py-4">
        <div className="text-sm text-ink leading-relaxed italic">
          Schools pay Populi + a separate LMS — typically $1,100–$1,500 / month — for
          an incomplete, disconnected solution. Atticus Operational replaces both at{" "}
          <span className="font-semibold not-italic">${MONTHLY.toLocaleString()} / month</span> and
          consolidates the data across enrollment, compliance, placement, and training so the
          same students and the same documents flow through one system.
        </div>
      </section>

      {/* FOOTER */}
      <div className="mt-10 pt-6 border-t border-rule flex items-center justify-between text-xs text-subtle">
        <div>
          Pricing inputs and module mapping live in{" "}
          <code className="font-mono">app/admin/subscription/page.tsx</code> · update there
          when seat count or tier changes.
        </div>
        <Link href="/admin" className="hover:text-ink">
          &larr; Back to overview
        </Link>
      </div>
    </div>
  );
}
