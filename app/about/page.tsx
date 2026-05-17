import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "About",
  description:
    "Florida Institute of Dental Assisting is a modern, AI-powered dental assisting school in Jacksonville, FL.",
};

const values = [
  {
    title: "Hire-ready graduates.",
    body: "Every program maps to a nationally recognized credential. We train for the job, not for the classroom.",
  },
  {
    title: "Small by design.",
    body: "1:12 instructor-to-student ratio. Real mentorship, real feedback, real accountability.",
  },
  {
    title: "AI on your side.",
    body: "Atticus handles admissions questions at 2am. Instructors focus on teaching. Everyone wins.",
  },
  {
    title: "Built for working adults.",
    body: "Hybrid schedules. Evening cohorts. Clinical placements near your zip code.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* HERO */}
      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
          <div className="max-w-3xl">
            <div className="eyebrow">About FIDA</div>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
              A modern institute for a modern workforce.
            </h1>
            <p className="mt-6 text-muted text-lg leading-relaxed">
              Florida Institute of Dental Assisting was built on a simple idea: the healthcare
              workforce needs more skilled people, and the path to getting there
              shouldn&rsquo;t be two years, a dead-end degree, or a mountain of debt.
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20">
        <div className="max-w-2xl mb-12">
          <div className="eyebrow">What we believe</div>
          <h2 className="mt-3 font-display text-4xl text-navy tracking-tight">
            Four things, done well.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v) => (
            <div key={v.title} className="card p-8 bg-white">
              <h3 className="font-display text-2xl text-navy leading-tight">{v.title}</h3>
              <p className="mt-3 text-muted leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OPERATING MODEL */}
      <section className="bg-paper-subtle border-y border-rule">
        <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-20">
          <div className="eyebrow">Operating model</div>
          <h2 className="mt-3 font-display text-4xl text-navy tracking-tight">
            Powered by Atticus&trade;
          </h2>
          <p className="mt-5 text-muted leading-relaxed">
            FIDA runs on Atticus &mdash; a four-pillar AI operating system for education:
            an AI Brain that answers student questions, an OS that handles scheduling and
            compliance, an LMS for coursework, and an LLS that keeps every student on
            track to graduation and beyond.
          </p>
          <p className="mt-4 text-muted leading-relaxed">
            The result: less paperwork for staff, faster answers for students, and more
            time for what actually matters &mdash; real instruction and real outcomes. FIDA
            is where we bring the best of that playbook to allied health.
          </p>
        </div>
      </section>

      {/* LOCATION */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 bg-white">
            <div className="eyebrow">Campus</div>
            <div className="mt-3 font-display text-2xl text-navy">Jacksonville, Florida</div>
            <p className="mt-2 text-muted text-sm leading-relaxed">
              Hybrid and in-person programs with clinical placements across Central Florida.
            </p>
          </div>
          <div className="card p-8 bg-white">
            <div className="eyebrow">Licensure</div>
            <div className="mt-3 font-display text-2xl text-navy">State of Florida</div>
            <p className="mt-2 text-muted text-sm leading-relaxed">
              Licensed by the Florida Commission for Independent Education.
            </p>
          </div>
          <div className="card p-8 bg-white">
            <div className="eyebrow">Next cohort</div>
            <div className="mt-3 font-display text-2xl text-navy">June 3, 2026</div>
            <p className="mt-2 text-muted text-sm leading-relaxed">
              Summer 2026 intake. Priority deadline: May 15.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-20 text-center">
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            See if FIDA is a fit.
          </h2>
          <p className="mt-5 text-navy-100 text-lg max-w-xl mx-auto">
            Start the conversation with Atticus. It takes about five minutes.
          </p>
          <div className="mt-10">
            <Link href="/admissions" className="btn-primary">
              Talk to Atticus <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
