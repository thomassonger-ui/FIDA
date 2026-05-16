import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

// Program data — sourced from official CIE Program Outlines on file with
// the Florida Commission for Independent Education (institution ID #6501).
// Last sync: 2026-05-16.

type Course = { code: string; title: string; hours: number };
type Program = {
  id: string;
  title: string;
  tagline: string;
  length: string;
  format: string;
  credential: string;
  tuition: string;
  cieId: string;
  textbook: string;
  prerequisites: string[];
  summary: string;
  courses: Course[];
};

const programs: Program[] = [
  {
    id: "radiography",
    title: "Radiography for Dental Personnel",
    tagline: "Florida-mandated dental radiography certification, delivered online.",
    length: "6 weeks · 14 clock hours (8 theory + 6 lab)",
    format: "Online — self-paced via FIDA Moodle",
    credential: "Diploma · Florida Dental Radiography Certification (FAC 64B5-9.011)",
    tuition: "$499.00",
    cieId: "6501",
    textbook:
      "Essentials of Dental Assisting, 7th Ed. — Robinson & Bird, Elsevier (ISBN 9780323764025)",
    prerequisites: [
      "Be at least 18 years of age.",
      "A minimum of 3 months of continuous on-the-job training assisting in the positioning and exposing of dental radiographs under direct supervision of a Florida-licensed dentist. Volunteer or shadowing experience does NOT count.",
      "Signed acknowledgement from your supervising dentist confirming the three months of training.",
      "Complete the online coursework.",
    ],
    summary:
      "A focused review course for dental personnel covering radiation health & safety, intra-oral and extra-oral imaging techniques, and quality control — the criteria currently required by Florida law to operate dental X-ray equipment. Includes self-study readings and a clinical competency assessment submitted via the LMS.",
    courses: [
      { code: "RHS101", title: "Foundations of Radiography, Radiographic Equipment, and Radiation Safety", hours: 2 },
      { code: "RHS102", title: "Dental Imaging, Dental Film, and Processing Radiographs", hours: 3 },
      { code: "RHS103", title: "Legal Issues, Quality Assurance, and Infection Prevention", hours: 3 },
      { code: "RHS104", title: "Intraoral Imaging", hours: 4 },
      { code: "RHS105", title: "Extraoral Imaging", hours: 2 },
    ],
  },
  {
    id: "efda",
    title: "Expanded Functions for the Dental Assistant",
    tagline: "Earn the EFDA certificate Florida requires for expanded clinical procedures.",
    length: "5 weeks · 20 clock hours (13 theory + 7 lab)",
    format: "Hybrid — online theory + on-campus clinical lab",
    credential: "Expanded Functions Dental Assistant Certificate",
    tuition: "$1,049.00",
    cieId: "6501",
    textbook:
      "Essentials of Dental Assisting, 7th Ed. — Robinson & Bird, Elsevier (ISBN 9780323764025)",
    prerequisites: [
      "Be at least 18 years of age.",
      "A minimum of 3 months of continuous on-the-job chairside training. Volunteer or shadowing does NOT count.",
      "Signed acknowledgement from your supervising dentist confirming the three months of training.",
      "Competency in reading, writing, and speaking English.",
      "Complete the online coursework before attending the campus lab.",
    ],
    summary:
      "Theory and hands-on training in expanded-function procedures performed by dental assistants in a Florida dental practice. Built around the current Dental Assisting National Board curriculum so graduates can perform expanded clinical functions under dentist supervision, in compliance with the Florida Board of Dentistry.",
    courses: [
      { code: "EFDA101", title: "Dental Sealants", hours: 1.5 },
      { code: "EFDA102", title: "Fluoride Placement", hours: 1.5 },
      { code: "EFDA103", title: "Polishing Clinical Crowns", hours: 1.5 },
      { code: "EFDA104", title: "Liners, Bases, and Bonding Systems", hours: 1.5 },
      { code: "EFDA105", title: "Temporary Restorations", hours: 1.5 },
      { code: "EFDA106", title: "Matrices", hours: 1.5 },
      { code: "EFDA107", title: "Alginate Impressions and Study Models", hours: 1.5 },
      { code: "EFDA108", title: "Fabricating Temporary Crowns", hours: 1.5 },
      { code: "EFDA109", title: "Placing Retraction Cord", hours: 1.5 },
      { code: "EFDA110", title: "Place / Remove Periodontal Dressing", hours: 1.5 },
      { code: "EFDA111", title: "Place / Remove Dental Dam", hours: 1.5 },
      { code: "EFDA112", title: "Suture Removal", hours: 1.5 },
      { code: "EFDA113", title: "Infection Control", hours: 2 },
    ],
  },
];

export const metadata = {
  title: "Programs",
  description:
    "FIDA programs — Radiography for Dental Personnel (Florida-mandated dental radiography certification) and Expanded Functions for the Dental Assistant (EFDA certificate).",
};

export default function ProgramsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* HEADER */}
      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow">Programs</div>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
              Florida-credentialed dental training, done right.
            </h1>
            <p className="mt-6 text-muted text-lg leading-relaxed">
              Two state-aligned diploma programs plus continuing education for
              working dental professionals. Both diplomas map directly to
              Florida Board of Dentistry requirements.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/admissions" className="btn-primary">
                Talk to Atticus <span aria-hidden="true">→</span>
              </Link>
              <a href="#compare" className="btn-ghost">
                Compare programs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="compare" className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16">
        <div className="card bg-white overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 border-b border-rule bg-paper-subtle">
            <div className="p-5 md:p-6 text-xs font-semibold tracking-[0.12em] uppercase text-navy/60">
              Program
            </div>
            <div className="p-5 md:p-6 text-xs font-semibold tracking-[0.12em] uppercase text-navy/60 border-l border-rule">
              Length
            </div>
            <div className="p-5 md:p-6 text-xs font-semibold tracking-[0.12em] uppercase text-navy/60 border-l border-rule">
              Credential
            </div>
            <div className="p-5 md:p-6 text-xs font-semibold tracking-[0.12em] uppercase text-navy/60 border-l border-rule">
              Tuition
            </div>
          </div>
          {programs.map((p, i) => (
            <div
              key={p.id}
              className={`grid grid-cols-1 md:grid-cols-4 ${i !== programs.length - 1 ? "border-b border-rule" : ""}`}
            >
              <div className="p-5 md:p-6">
                <a href={`#${p.id}`} className="font-display text-xl text-navy hover:text-teal transition-colors">
                  {p.title}
                </a>
              </div>
              <div className="p-5 md:p-6 text-navy md:border-l border-rule">{p.length}</div>
              <div className="p-5 md:p-6 text-navy md:border-l border-rule">{p.credential}</div>
              <div className="p-5 md:p-6 text-navy font-semibold md:border-l border-rule">{p.tuition}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-subtle">
          Florida Commission for Independent Education · institution ID #6501.
        </div>
      </section>

      {/* PROGRAM DEEP DIVES */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pb-20 space-y-16">
        {programs.map((p, idx) => (
          <article key={p.id} id={p.id} className="scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Left: meta */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 text-teal font-display text-lg">
                    {idx + 1}
                  </span>
                  <div className="eyebrow">Program 0{idx + 1}</div>
                </div>
                <h2 className="mt-4 font-display text-3xl md:text-4xl text-navy leading-tight">
                  {p.title}
                </h2>
                <p className="mt-2 text-teal font-semibold">{p.tagline}</p>

                <dl className="mt-6 space-y-4 text-sm">
                  <MetaRow label="Length" value={p.length} />
                  <MetaRow label="Format" value={p.format} />
                  <MetaRow label="Credential" value={p.credential} />
                  <MetaRow label="Tuition" value={p.tuition} emphasis />
                  <MetaRow label="CIE ID" value={`#${p.cieId}`} />
                  <MetaRow label="Textbook" value={p.textbook} />
                </dl>

                <Link
                  href={`/admissions?program=${p.id}`}
                  className="btn-primary mt-8 w-full"
                >
                  Apply to this program <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* Right: content */}
              <div className="lg:col-span-2 card bg-white p-8 md:p-10">
                <p className="text-navy text-lg leading-relaxed">{p.summary}</p>

                <div className="mt-8">
                  <div className="eyebrow">Before you enroll</div>
                  <ul className="mt-4 space-y-2.5">
                    {p.prerequisites.map((pre, i) => (
                      <li key={i} className="flex items-start gap-3 text-navy">
                        <span className="mt-1 w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700 text-[10px] font-bold">
                          !
                        </span>
                        <span className="text-sm leading-relaxed">{pre}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <div className="eyebrow">Course breakdown</div>
                  <div className="mt-4 border border-rule rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-paper-subtle">
                        <tr className="text-left text-xs uppercase tracking-wider text-muted">
                          <th className="px-4 py-2.5 font-semibold">Course #</th>
                          <th className="px-4 py-2.5 font-semibold">Title</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.courses.map((c, i) => (
                          <tr key={c.code} className={i !== 0 ? "border-t border-rule" : ""}>
                            <td className="px-4 py-2.5 font-mono text-xs text-navy">{c.code}</td>
                            <td className="px-4 py-2.5 text-navy">{c.title}</td>
                            <td className="px-4 py-2.5 text-navy text-right tabular-nums">{c.hours}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-rule bg-paper-subtle/60">
                          <td className="px-4 py-2.5 font-semibold text-navy" colSpan={2}>Total</td>
                          <td className="px-4 py-2.5 font-semibold text-navy text-right tabular-nums">
                            {p.courses.reduce((sum, c) => sum + c.hours, 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* PROFESSIONAL DEVELOPMENT / CE SECTION */}
      <section className="bg-paper-subtle border-t border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
          <div className="max-w-3xl mb-10">
            <div className="eyebrow">Continuing Education</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight">
              Professional development for working dental teams.
            </h2>
            <p className="mt-5 text-muted text-lg leading-relaxed">
              Short, focused CE courses for licensed dental assistants and
              hygienists — designed around Florida licensure requirements and
              the day-to-day skills working teams ask us for most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              { title: "Infection Control & OSHA", body: "Annual refresh on current CDC and OSHA bloodborne-pathogen standards for dental settings." },
              { title: "Radiation Health & Safety", body: "Short refreshers for radiography-certified personnel between renewals." },
              { title: "HIPAA for Dental Teams", body: "Practical patient-privacy compliance — what changed, what didn't, what auditors check for." },
              { title: "Medical Emergencies in the Office", body: "Recognize and respond — syncope, anaphylaxis, cardiac events, airway compromise." },
              { title: "Sterilization & Instrument Processing", body: "Hands-on review of CDC-aligned reprocessing workflows and biological monitoring." },
              { title: "Custom team training", body: "Group sessions tailored to your practice — onboarding new assistants, refreshing veterans, prepping for state inspections." },
            ].map((c) => (
              <div key={c.title} className="card bg-white p-5">
                <div className="font-display text-lg text-navy mb-1.5">{c.title}</div>
                <p className="text-sm text-muted leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="card bg-white p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-display text-xl text-navy mb-1">Want the CE schedule?</div>
              <p className="text-sm text-muted max-w-md">
                Tell us which courses your team needs and we&rsquo;ll send dates,
                pricing, and group rates.
              </p>
            </div>
            <a href="mailto:success@fldentalassisting.com?subject=Professional%20Development%20interest" className="btn-primary">
              Email Us Today
            </a>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-20 text-center">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft">
            Not sure which one is right for you?
          </div>
          <h2 className="mt-4 font-display text-4xl md:text-5xl leading-tight">
            Atticus can help you decide.
          </h2>
          <p className="mt-5 text-navy-100 text-lg max-w-2xl mx-auto">
            Tell us about your background, schedule, and what you care about &mdash;
            Atticus will match you to the program that fits.
          </p>
          <div className="mt-10">
            <Link href="/admissions" className="btn-primary">
              Start the conversation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MetaRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-24 text-navy/60 font-semibold tracking-wide uppercase text-xs pt-0.5 flex-shrink-0">
        {label}
      </dt>
      <dd className={emphasis ? "text-navy font-semibold" : "text-navy"}>{value}</dd>
    </div>
  );
}
