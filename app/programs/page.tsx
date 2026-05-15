import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

// PLACEHOLDER program details — Tom: confirm length, format, credential, salary,
// demand, summary, and modules with FIDA's real curriculum before going live.
const programs = [
  {
    id: "radiography",
    title: "Radiography for Dental Personnel",
    tagline: "Florida's mandated dental radiography certification &mdash; online.",
    length: "~3 weeks self-paced",
    format: "Online via FIDA Moodle",
    credential: "Florida Dental Radiography Certification (FAC 64B5-9.011)",
    salary: "PLACEHOLDER",
    demand: "Required for all FL dental personnel operating X-ray equipment",
    summary:
      "The state-mandated certification every dental personnel in Florida needs to legally operate dental radiography equipment. Delivered fully online via FIDA's Moodle, with proctored final assessment.",
    modules: [
      "Radiation physics &amp; biology",
      "Radiation safety &amp; protection",
      "Dental radiographic techniques",
      "Image evaluation &amp; quality assurance",
      "Florida-specific regulatory requirements",
      "Proctored final exam",
    ],
  },
  {
    id: "efda",
    title: "Expanded Functions Dental Auxiliary (EFDA)",
    tagline: "Clinical-ready dental auxiliary credential in 12 weeks.",
    length: "12 weeks",
    format: "Hybrid &mdash; online theory + clinical lab",
    credential: "Florida EFDA credential",
    salary: "PLACEHOLDER",
    demand: "PLACEHOLDER &mdash; confirm Florida BLS data",
    summary:
      "Earn the credential Florida requires for dental assistants to perform expanded clinical functions under dentist supervision. Increases your scope of practice, your value to employers, and your earning potential.",
    modules: [
      "Expanded clinical procedures",
      "Coronal polishing &amp; sealants",
      "Impression techniques &amp; provisional restorations",
      "Infection control &amp; OSHA compliance",
      "Florida dental practice act",
      "Supervised clinical rotation",
    ],
  },
  {
    id: "dental-assisting",
    title: "Dental Assisting Foundation",
    tagline: "PLACEHOLDER tagline.",
    length: "PLACEHOLDER",
    format: "PLACEHOLDER",
    credential: "PLACEHOLDER",
    salary: "PLACEHOLDER",
    demand: "PLACEHOLDER",
    summary:
      "PLACEHOLDER program description &mdash; confirm whether FIDA offers a foundational dental assisting program separate from EFDA, and provide curriculum details.",
    modules: [
      "PLACEHOLDER module 1",
      "PLACEHOLDER module 2",
      "PLACEHOLDER module 3",
      "PLACEHOLDER module 4",
      "PLACEHOLDER module 5",
      "PLACEHOLDER module 6",
    ],
  },
];

export const metadata = {
  title: "Programs",
  description:
    "Radiography for Dental Personnel, EFDA, and Dental Assisting programs at Florida Institute of Dental Assisting.",
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
              Train for the healthcare job you actually want.
            </h1>
            <p className="mt-6 text-muted text-lg leading-relaxed">
              Three focused programs. Every one builds toward a nationally recognized
              credential. Every one gets you hire-ready in under a year.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/admissions" className="btn-primary">
                Talk to Atticus <span aria-hidden="true">→</span>
              </Link>
              <a href="#compare" className="btn-ghost">
                Compare all three
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
              Starting salary
            </div>
          </div>
          {programs.map((p, i) => (
            <div
              key={p.id}
              className={`grid grid-cols-1 md:grid-cols-4 ${i !== programs.length - 1 ? "border-b border-rule" : ""}`}
            >
              <div className="p-5 md:p-6">
                <a href={`#${p.id}`} className="font-display text-xl text-navy hover:text-teal transition-colors" dangerouslySetInnerHTML={{ __html: p.title }} />
              </div>
              <div className="p-5 md:p-6 text-navy md:border-l border-rule">{p.length}</div>
              <div className="p-5 md:p-6 text-navy md:border-l border-rule" dangerouslySetInnerHTML={{ __html: p.credential }} />
              <div
                className="p-5 md:p-6 text-navy font-semibold md:border-l border-rule"
                dangerouslySetInnerHTML={{ __html: p.salary }}
              />
            </div>
          ))}
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
                <h2
                  className="mt-4 font-display text-3xl md:text-4xl text-navy leading-tight"
                  dangerouslySetInnerHTML={{ __html: p.title }}
                />
                <p className="mt-2 text-teal font-semibold">{p.tagline}</p>

                <dl className="mt-6 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <dt className="w-24 text-navy/60 font-semibold tracking-wide uppercase text-xs pt-0.5">Length</dt>
                    <dd className="text-navy">{p.length}</dd>
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="w-24 text-navy/60 font-semibold tracking-wide uppercase text-xs pt-0.5">Format</dt>
                    <dd className="text-navy" dangerouslySetInnerHTML={{ __html: p.format }} />
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="w-24 text-navy/60 font-semibold tracking-wide uppercase text-xs pt-0.5">Credential</dt>
                    <dd className="text-navy" dangerouslySetInnerHTML={{ __html: p.credential }} />
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="w-24 text-navy/60 font-semibold tracking-wide uppercase text-xs pt-0.5">Salary</dt>
                    <dd className="text-navy font-semibold" dangerouslySetInnerHTML={{ __html: p.salary }} />
                  </div>
                  <div className="flex items-start gap-3">
                    <dt className="w-24 text-navy/60 font-semibold tracking-wide uppercase text-xs pt-0.5">Demand</dt>
                    <dd className="text-navy" dangerouslySetInnerHTML={{ __html: p.demand }} />
                  </div>
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
                <p
                  className="text-navy text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: p.summary }}
                />

                <div className="mt-8">
                  <div className="eyebrow">What you&rsquo;ll learn</div>
                  <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {p.modules.map((m) => (
                      <li key={m} className="flex items-start gap-3 text-navy">
                        <span className="mt-1.5 w-4 h-4 rounded-full bg-teal/10 border border-teal/40 flex items-center justify-center flex-shrink-0">
                          <span className="w-1 h-1 rounded-full bg-teal" />
                        </span>
                        <span
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: m }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
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
