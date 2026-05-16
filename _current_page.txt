import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

// PLACEHOLDER program data — Tom: confirm lengths, credentials, and add real FIDA program details.
const programs = [
  {
    title: "Radiography for Dental Personnel",
    length: "Self-paced &middot; ~3 weeks",
    outcome: "Florida Dental Radiography Cert. (FAC 64B5-9.011)",
    blurb:
      "The state-mandated radiography certification for dental personnel in Florida &mdash; delivered online via FIDA's Moodle.",
    href: "/programs#radiography",
  },
  {
    title: "Expanded Functions Dental Auxiliary (EFDA)",
    length: "12 weeks",
    outcome: "Florida EFDA credential",
    blurb:
      "Earn the expanded-functions credential Florida dental assistants need to deliver more clinical services under dentist supervision.",
    href: "/programs#efda",
  },
  {
    title: "Dental Assisting Foundation",
    length: "PLACEHOLDER",
    outcome: "PLACEHOLDER credential",
    blurb:
      "Foundational dental assisting training &mdash; confirm program details with FIDA before going live.",
    href: "/programs#dental-assisting",
  },
];

const pillars = [
  { stat: "94%", label: "Graduate placement rate", note: "Within 6 months of completion" },
  { stat: "1:12", label: "Instructor-to-student ratio", note: "Real mentorship, not lecture halls" },
  { stat: "AI", label: "Powered operations", note: "Atticus runs admissions, scheduling, and student success" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-navy">
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-fade" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-24 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal-soft text-xs font-semibold tracking-[0.14em] uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              Now enrolling &mdash; Summer 2026
            </div>

            <h1 className="mt-6 text-white font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Your career in <span className="text-teal-soft">dentistry &mdash; and the courses that grow it.</span>
            </h1>

            <p className="mt-6 text-navy-100 text-lg md:text-xl leading-relaxed max-w-xl">
              Florida Institute of Dental Assisting trains the next generation of dental assistants &mdash;
              radiography-certified, EFDA-credentialed, and clinic-ready. Meet <strong className="text-white">Atticus</strong>,
              our AI admissions advisor, and figure out your next step in five minutes.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/admissions" className="btn-primary">
                Talk to Atticus <span aria-hidden="true">→</span>
              </Link>
              <Link href="/programs" className="btn-secondary">
                Explore programs
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-navy-200">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal" />
                Licensed by the State of Florida
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal" />
                Nationally recognized certifications
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal" />
                Financial aid available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {pillars.map((p) => (
            <div key={p.label} className="flex items-start gap-4">
              <div className="font-display text-5xl text-teal leading-none">{p.stat}</div>
              <div>
                <div className="text-navy font-semibold text-sm">{p.label}</div>
                <div className="text-muted text-sm mt-0.5">{p.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <div className="eyebrow">Programs</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight">
              Three paths. One destination: <em className="text-teal not-italic">a real career.</em>
            </h2>
          </div>
          <Link href="/programs" className="btn-ghost">
            See all programs <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((p) => (
            <Link key={p.title} href={p.href} className="card card-hover p-8 flex flex-col group">
              <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.1em] uppercase text-teal">
                <span>{p.length}</span>
                <span className="w-1 h-1 rounded-full bg-rule" />
                <span>{p.outcome}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl text-navy leading-tight">{p.title}</h3>
              <p
                className="mt-3 text-muted leading-relaxed text-sm"
                dangerouslySetInnerHTML={{ __html: p.blurb }}
              />
              <div className="mt-6 pt-6 border-t border-rule flex items-center justify-between text-sm font-semibold text-navy group-hover:text-teal transition-colors">
                Program details
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY FIDA */}
      <section className="bg-paper-subtle">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="eyebrow">Why FIDA</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight">
                Smaller class. Smarter system. Real career.
              </h2>
              <div className="mt-8 space-y-5">
                {[
                  {
                    title: "An AI advisor in your corner, 24/7.",
                    body: "Atticus answers your questions, walks you through admissions, and keeps your enrollment on track &mdash; even at 11pm before a shift.",
                  },
                  {
                    title: "Built for working adults.",
                    body: "Hybrid schedules, evening cohorts, and clinical placements near your zip code. You shouldn&rsquo;t have to quit your job to change your career.",
                  },
                  {
                    title: "Credentials that employers trust.",
                    body: "Every program aligns to a nationally recognized certification &mdash; CCMA, CPC, CCA, CPCT/A &mdash; so you graduate hire-ready.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="mt-1.5 w-5 h-5 rounded-full bg-teal/15 border border-teal/40 flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{item.title}</div>
                      <p
                        className="mt-1 text-muted text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.body }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-8 md:p-10 bg-white shadow-card">
              <div className="eyebrow">Next cohort</div>
              <div className="mt-2 font-display text-4xl text-navy">June 3, 2026</div>
              <p className="mt-3 text-muted text-sm leading-relaxed">
                Jacksonville campus. Hybrid and evening options. Seats fill 6&ndash;8 weeks before start date.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="border border-rule rounded-md p-4">
                  <div className="text-xs font-semibold tracking-[0.1em] uppercase text-teal">
                    Priority deadline
                  </div>
                  <div className="mt-1 font-display text-lg text-navy">May 15</div>
                </div>
                <div className="border border-rule rounded-md p-4">
                  <div className="text-xs font-semibold tracking-[0.1em] uppercase text-teal">
                    Seats remaining
                  </div>
                  <div className="mt-1 font-display text-lg text-navy">24 / 60</div>
                </div>
              </div>

              <Link href="/admissions" className="btn-primary w-full mt-8">
                Start with Atticus <span aria-hidden="true">→</span>
              </Link>
              <p className="mt-3 text-xs text-subtle text-center">Free, no commitment. 5 minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MEET ATTICUS */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-2">
            <div className="relative aspect-square max-w-sm mx-auto">
              {/* Soft teal halo */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full opacity-70"
                style={{
                  background:
                    "radial-gradient(circle, rgba(44,177,188,0.25), rgba(44,177,188,0) 70%)",
                }}
              />
              <Image
                src="/atticus-logo.png"
                alt="Atticus — AI admissions advisor"
                width={512}
                height={512}
                priority
                className="relative w-full h-full object-contain p-8"
              />
            </div>
            <div className="mt-6 text-center">
              <div className="font-display text-2xl text-navy">Atticus</div>
              <div className="mt-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-teal">
                AI Admissions Advisor
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="eyebrow">Meet Atticus</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-tight">
              An AI admissions advisor &mdash; <span className="text-teal">not a chatbot.</span>
            </h2>
            <p className="mt-5 text-muted text-lg leading-relaxed max-w-xl">
              Atticus is our real AI advisor, built on Claude. It knows our programs inside-out,
              answers your questions honestly, and helps you figure out the right fit &mdash;
              without pressure, without forms, and without putting you in a phone queue.
            </p>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { title: "No forms to fill out", body: "Just a five-minute conversation." },
                { title: "Honest program guidance", body: "Atticus will tell you if FIDA isn't the right fit." },
                { title: "Real human hand-off", body: "A FIDA advisor follows up within one business day." },
                { title: "Available anytime", body: "2am the night before a shift? Atticus is up." },
              ].map((f) => (
                <li key={f.title} className="flex gap-3">
                  <div className="mt-1 w-4 h-4 rounded-full bg-teal/15 border border-teal/40 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  </div>
                  <div>
                    <div className="font-semibold text-navy">{f.title}</div>
                    <div className="text-muted text-xs mt-0.5 leading-relaxed">{f.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-navy text-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 30%, rgba(44,177,188,0.55), transparent 50%), radial-gradient(circle at 15% 80%, rgba(44,177,188,0.25), transparent 45%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24 text-center">
          <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft">
            Your next chapter
          </div>
          <h2 className="mt-4 font-display text-white text-4xl md:text-5xl lg:text-6xl leading-tight">
            Talk to Atticus. No pressure. No forms.
          </h2>
          <p className="mt-5 text-navy-100 text-lg max-w-2xl mx-auto">
            <strong className="text-white">Atticus</strong> is our AI admissions advisor.
            Tell it where you are and where you want to go &mdash; it&rsquo;ll help you figure
            out the right program in about five minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/admissions" className="btn-primary">
              Start the conversation <span aria-hidden="true">→</span>
            </Link>
            <Link href="/programs" className="btn-secondary">
              Compare programs first
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
