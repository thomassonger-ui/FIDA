/**
 * SoR (System of Record) audit page.
 *
 * This is the one-stop view an owner or accreditor can open to see exactly
 * which parts of Apex SIS are demo-only, partial, or not yet built — plus
 * the flags to watch and the recommended next build step. Nothing here
 * pretends to be compliance evidence; it IS the disclosure.
 */

type ModuleStatus = "built" | "partial" | "demo_only" | "not_built";

type ModuleRow = {
  letter: string;
  title: string;
  status: ModuleStatus;
  summary: string;
  have: string[];
  missing: string[];
  flag: string;
};

const MODULES: ModuleRow[] = [
  {
    letter: "A",
    title: "Student Master Record",
    status: "demo_only",
    summary:
      "Demo roster generates fullname/email/risk tier/attendance/grade per cohort, but nothing persists.",
    have: [
      "25 deterministic demo students per tracked cohort",
      "Risk tier + attendance + grade signals",
    ],
    missing: [
      "DOB",
      "SSN (or last-4 reference)",
      "Legal name separate from display name",
      "CIP code",
      "Enrollment status enum (Active / LOA / Withdrawn / Graduated)",
      "Start date / expected completion date",
      "Real Postgres students table",
    ],
    flag:
      "Deterministic demo IDs (negative ints) don\u2019t survive a page refresh as real records \u2014 you\u2019re showing data that doesn\u2019t exist anywhere auditable.",
  },
  {
    letter: "B",
    title: "Enrollment & Admissions Tracking",
    status: "partial",
    summary:
      "Atticus \u2192 atticus_sessions \u2192 handoff captures the top of the funnel and the transcript is preserved. Everything downstream is missing.",
    have: [
      "Atticus intake conversations persisted (atticus_sessions + atticus_messages)",
      "Handoff timestamps per session",
      "Lead \u2192 transcript trail for 30 days",
    ],
    missing: [
      "Signed enrollment agreement storage",
      "Financial responsibility disclosure signatures",
      "Applicant \u2192 Enrolled transition timestamps",
      "Append-only audit log for record changes",
    ],
    flag:
      "\u201CAudit trail (no edits without logs)\u201D is the hardest requirement \u2014 Postgres row mutation logging needs to be designed before anyone touches student records in prod. Consider an audit_events append-only table with triggers.",
  },
  {
    letter: "C",
    title: "Attendance Tracking",
    status: "demo_only",
    summary:
      "/admin/attendance simulates 16 weekly sessions with present/late/absent via Math.sin seeding. Not clock-hour aware.",
    have: [
      "Simulated 16-session history per tracked cohort",
      "Per-student present/late/absent breakdown",
      "Class-wide recent-sessions table",
    ],
    missing: [
      "Clock-hour tracking (critical for allied-health Title IV)",
      "Instructor validation step",
      "Daily attendance logs (vs weekly)",
      "Tardy tracking distinct from absence",
    ],
    flag:
      "Clock-hour programs (which allied-health often are) have much stricter attendance requirements than credit-hour \u2014 you need to pick a model early. Moodle\u2019s attendance plugin can carry this if enabled.",
  },
  {
    letter: "D",
    title: "Academic Progress / SAP Engine",
    status: "demo_only",
    summary:
      "Demo SAP dashboard built at /admin/sap with GPA, pace %, state machine, and evaluation checkpoints \u2014 but nothing persists to a real table.",
    have: [
      "GPA + pace % threshold bars per student",
      "Warning \u2192 Probation \u2192 Termination state machine (deterministic)",
      "3 evaluation checkpoints (weeks 4, 8, 12) with advisor notes",
      "Compliance notes (evaluation windows, advisor sign-off, appeals, Title IV)",
      "Production-entry callout explaining how real data would flow",
    ],
    missing: [
      "Real sap_evaluations Postgres table (append-only)",
      "Advisor sign-off workflow (blocked until signed)",
      "Calendar-triggered evaluations (vs. static demo checkpoints)",
      "GPA pulled from Moodle gradebook via API",
      "Appeal submission + committee decision records",
    ],
    flag:
      "The demo shows the full state machine but transitions are deterministic, not advisor-driven. In production every transition must be blocked until an advisor signs off with a timestamped note. Unsigned transitions are an audit finding.",
  },
  {
    letter: "E",
    title: "Financial Ledger",
    status: "demo_only",
    summary:
      "Demo ledger built at /admin/ledger with tuition, aid, payments, balances, and one R2T4 scenario \u2014 but no real financial data or third-party integration.",
    have: [
      "Per-student tuition charges, registration fees",
      "Financial aid (Pell Grant) disbursement entries",
      "Student payment records with running balance",
      "R2T4 return scenario for withdrawn student",
      "Third-party integration architecture callout (Regent / CampusNexus / Populi)",
      "Production-entry callout explaining data flow",
    ],
    missing: [
      "Real financial tables or third-party ledger integration",
      "Actual R2T4 federal formula calculation engine",
      "Title IV processor sync (COD/SAIG)",
      "Contra-entry correction workflow (no edits, only new entries)",
      "Bursar role with scoped write access",
    ],
    flag:
      "R2T4 (Return to Title IV) refund calculation is a federal formula that must be mathematically exact and audit-reproducible. Don\u2019t roll your own math \u2014 use a vetted vendor (Regent, CampusNexus) for the ledger and wire Apex SIS on top as the reporting layer.",
  },
  {
    letter: "F",
    title: "Document Vault / Audit Locker",
    status: "demo_only",
    summary:
      "Demo vault built at /admin/documents with SHA-256 hashing, upload form, retention scheduling, and WORM lock indicators. Supabase Storage + hash chain (Option 2) \u2014 production should upgrade to S3 Object Lock.",
    have: [
      "Upload form with category, student name, file picker, notes",
      "SHA-256 hash computed at upload time",
      "Retention schedule per document category (3\u201350 years)",
      "WORM lock status indicator per document",
      "Document table with hash, uploader, timestamp, retention",
      "API route (POST /api/admin/documents) for Supabase Storage upload",
      "Architecture callout: Option 2 now, S3 Object Lock for production",
      "Production-entry callout explaining data flow",
    ],
    missing: [
      "S3 Object Lock integration (true WORM \u2014 production upgrade)",
      "Real document_records Postgres table + Supabase Storage bucket",
      "Per-student document completeness checklist",
      "Download with audit logging (who accessed what, when)",
      "Retention expiry automation (archive or delete on schedule)",
    ],
    flag:
      "The demo uses Supabase Storage + hash chain, which proves integrity but not immutability \u2014 an admin could still delete the file. For a real accreditation visit, upgrade to S3 Object Lock in compliance mode where nobody, including root, can modify locked objects.",
  },
  {
    letter: "G",
    title: "Job Placement Tracking",
    status: "demo_only",
    summary:
      "Demo placement dashboard built at /admin/placement with employer records, in-field validation, wage data, and verification workflow \u2014 but nothing persists.",
    have: [
      "Per-graduate employer name, position title, start date",
      "In-field vs. out-of-field status with justification text",
      "Verification workflow (verifier name + date)",
      "Optional consented wage data with privacy controls",
      "Computed placement rates replacing static 82% KPI",
      "Accreditor definition warning (ACCSC vs COE)",
      "Production-entry callout explaining data flow",
    ],
    missing: [
      "Real placements Postgres table with audit trail",
      "Employer verification call/letter upload step",
      "Career services staff entry form",
      "Wage consent/revocation workflow",
      "Accreditor-specific in-field definition enforcement",
    ],
    flag:
      "Accreditor (ACCSC / COE) placement definitions differ \u2014 \u201Cin-field\u201D criteria must be documented and enforced at data-entry time. Wage data pulls you into privacy territory and should be optional + consented.",
  },
  {
    letter: "H",
    title: "External SIS Integration (Partner Adapters)",
    status: "not_built",
    summary:
      "Atticus is designed to sit on top of a partner SIS (Populi, FAME Freedom, Campus Cloud) for schools that already have one. Apex itself runs on its own Supabase stack \u2014 the partner-adapter layer is documented but not yet wired.",
    have: [
      "Adapter pattern documented (lib/sis/ split: populi.ts, fame.ts, campuscloud.ts, supabase.ts)",
      "Partnership tier map \u2014 Populi, FAME, Campus Cloud as Tier 1 integrations",
      "Read/write boundary defined \u2014 Atticus reads from SIS, writes only to atticus_* tables",
      "Battlecard + pairing playbook documented as external reference",
    ],
    missing: [
      "Real lib/sis/populi.ts adapter (REST client with OAuth)",
      "Encrypted credential storage (Supabase Vault for partner API keys)",
      "Scheduled sync engine (hourly pull of students, attendance, SAP)",
      "sis_integrations table (one row per connected school)",
      "sis_sync_log append-only audit table",
      "Reconciliation engine (flag SIS vs Atticus field-level mismatch)",
      "Admin UI at /admin/integrations (Connect / Configure / Sync now)",
    ],
    flag:
      "External systems create data-lineage questions \u2014 auditors ask \u201Cwhich system is the record of truth?\u201D The answer must be documented per field: SIS owns enrollment, attendance, and financial aid; Atticus owns analysis, interventions, and the compliance narrative. Crossing the line destroys audit defensibility.",
  },
];

const FLAGS: { title: string; body: string }[] = [
  {
    title: "Demo vs product is conflated",
    body:
      "Blueprint School is currently a presentation-grade mockup. Moving to SoR means a hard rewrite of the data layer with durable tables, migrations, RLS, and audit triggers. Budget 6\u201310 weeks for Phase 1 if it has to withstand a real ACCSC visit \u2014 not the 2\u20133 weeks the plan doc suggests.",
  },
  {
    title: "Atticus-on-top is the right architecture",
    body:
      "Don\u2019t bake intelligence into the SoR. Keep Atticus reading from SIS views and writing only to atticus_* tables. That way audits have one story (SIS) and intelligence stays a replaceable layer.",
  },
  {
    title: "Moodle stays the LMS",
    body:
      "Don\u2019t rebuild courses or the gradebook. SIS pulls grade snapshots from Moodle on a schedule and stores its own audit-grade copy. Two sources of truth is fine if one is clearly canonical per purpose.",
  },
  {
    title: "PII surface is about to grow fast",
    body:
      "DOB and SSN pull you into FERPA + state-specific data protection law. Once SSN lives in the database, you need encryption at rest with separate key management, access logging, and retention policies. Consider deferring SSN storage \u2014 many SIS systems store last-4 only for cross-referencing.",
  },
  {
    title: "Interventions are about to become compliance-adjacent",
    body:
      "Once SAP is real, the intervention timeline doubles as evidence that the school is acting on warning signals. Great for defense in an audit \u2014 but also means you can\u2019t silently delete or rewrite intervention records. Append-only from day one.",
  },
  {
    title: "UI ambition is a risk too",
    body:
      "The \u201COverview / Attendance / Academics / Financial / Documents / Placement\u201D tabbed student profile is a big design project. Prototype one student profile end-to-end before extrapolating the pattern to scale.",
  },
  {
    title: "Pick your accreditor target early",
    body:
      "ACCSC vs COE vs regional \u2014 their definitions of attendance, placement, and SAP diverge. Building to the wrong standard now means a bigger rewrite later.",
  },
  {
    title: "SIS reconciliation and data lineage",
    body:
      "Once Atticus reads from an external SIS (Populi, FAME, Campus Cloud), any disagreement between SIS and Atticus becomes a compliance exposure. Define record-of-truth per field before wiring the first adapter \u2014 SIS owns records, Atticus owns analysis. Flag stale syncs >24h, field-level mismatches, and expired credentials on the admin dashboard so the disagreement surfaces immediately instead of showing up in an audit.",
  },
];

function StatusBadge({ status }: { status: ModuleStatus }) {
  const map: Record<ModuleStatus, { label: string; cls: string }> = {
    built: { label: "Built", cls: "bg-green-50 text-green-900 border-green-200" },
    partial: { label: "Partial", cls: "bg-amber-50 text-amber-900 border-amber-200" },
    demo_only: { label: "Demo only", cls: "bg-amber-50 text-amber-900 border-amber-200" },
    not_built: { label: "Not built", cls: "bg-red-50 text-red-900 border-red-200" },
  };
  const s = map[status];
  return (
    <span
      className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

export default function CompliancePage() {
  const counts = {
    built: MODULES.filter((m) => m.status === "built").length,
    partial: MODULES.filter((m) => m.status === "partial").length,
    demoOnly: MODULES.filter((m) => m.status === "demo_only").length,
    notBuilt: MODULES.filter((m) => m.status === "not_built").length,
  };

  return (
    <div>
      <div className="eyebrow mb-3">SoR audit</div>
      <h1 className="text-3xl md:text-4xl mb-2">System of Record status</h1>
      <p className="text-muted max-w-prose mb-8">
        Compliance-first audit of Apex SIS against the eight required modules
        (A&ndash;H). What exists in the demo, what&rsquo;s partial, what&rsquo;s
        not built yet, and the flags to watch before any of this goes near an
        accreditation visit.
      </p>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-green-800">
            {counts.built}
          </div>
          <div className="eyebrow mt-1">Built</div>
          <div className="text-xs text-subtle mt-1">of 8 modules</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-amber-700">
            {counts.partial}
          </div>
          <div className="eyebrow mt-1">Partial</div>
          <div className="text-xs text-subtle mt-1">some real, some demo</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-amber-700">
            {counts.demoOnly}
          </div>
          <div className="eyebrow mt-1">Demo only</div>
          <div className="text-xs text-subtle mt-1">nothing persists</div>
        </div>
        <div className="border border-rule bg-paper p-5 rounded-sm">
          <div className="font-display text-3xl text-red-700">
            {counts.notBuilt}
          </div>
          <div className="eyebrow mt-1">Not built</div>
          <div className="text-xs text-subtle mt-1">gap</div>
        </div>
      </div>

      {/* Module cards */}
      <section className="mb-14">
        <div className="eyebrow mb-4">Required modules</div>
        <div className="space-y-5">
          {MODULES.map((m) => (
            <article
              key={m.letter}
              className="border border-rule bg-paper rounded-sm p-6"
            >
              <div className="flex items-start gap-4 mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-sm bg-paper-subtle border border-rule font-display text-lg text-ink shrink-0">
                  {m.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg text-ink">{m.title}</h3>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-sm text-muted mt-1">{m.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 pl-0 md:pl-12">
                <div>
                  <div className="eyebrow mb-2 text-green-800">
                    What&rsquo;s here
                  </div>
                  {m.have.length > 0 ? (
                    <ul className="text-sm text-ink space-y-1.5 list-disc pl-5">
                      {m.have.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-subtle">Nothing yet.</p>
                  )}
                </div>
                <div>
                  <div className="eyebrow mb-2 text-red-700">
                    What&rsquo;s missing
                  </div>
                  <ul className="text-sm text-ink space-y-1.5 list-disc pl-5">
                    {m.missing.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pl-0 md:pl-12">
                <div className="border-l-2 border-amber-300 bg-amber-50/60 rounded-r-sm px-4 py-3">
                  <div className="eyebrow text-amber-900 mb-1">Flag</div>
                  <p className="text-sm text-amber-950 leading-relaxed">
                    {m.flag}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Cross-cutting flags */}
      <section className="mb-14">
        <div className="eyebrow mb-4">Flags to watch (cross-cutting)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FLAGS.map((f, i) => (
            <div
              key={f.title}
              className="border border-rule bg-paper rounded-sm p-5"
            >
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-xs text-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="text-sm text-ink font-medium">{f.title}</h4>
              </div>
              <p className="text-sm text-muted leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendation */}
      <section className="mb-14">
        <div className="eyebrow mb-4">Recommended next build step</div>
        <div className="border border-rule bg-paper-subtle rounded-sm p-6">
          <p className="text-sm text-ink leading-relaxed mb-3">
            Queue (not now) the smallest move that turns demo into SoR
            foundation: a single real{" "}
            <code className="font-mono text-xs bg-paper px-1">students</code>{" "}
            table with RLS, plus an{" "}
            <code className="font-mono text-xs bg-paper px-1">audit_events</code>{" "}
            append-only table with row-level triggers. Migrate the Overview
            watchlist to read from it instead of{" "}
            <code className="font-mono text-xs bg-paper px-1">demoStudents()</code>.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Everything else stacks on top &mdash; preferably via third-party
            integrations (financial ledger, document vault) kept in their own
            service boundary. Keeping those concerns separate is smart for
            audit purposes: when the auditor asks &ldquo;where does this data
            live and who can change it,&rdquo; the answer is one service per
            answer, not one app for everything.
          </p>
        </div>
      </section>

      <p className="text-xs text-subtle">
        Generated from the Apex SIS compliance-first system design. Update
        when modules ship.
      </p>
    </div>
  );
}
