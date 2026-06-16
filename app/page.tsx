import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: {
    absolute:
      "Dental Assisting School in Jacksonville, FL | Florida Institute of Dental Assisting",
  },
  description:
    "Become a dental assistant in Jacksonville, Florida. FIDA offers an Entry Level Dental Assisting diploma plus EFDA and Radiography courses approved by the Florida Board of Dentistry.",
  alternates: { canonical: "/" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Florida Institute of Dental Assisting",
  alternateName: "FIDA",
  url: "https://fldentalassisting.online",
  description:
    "Dental assisting school in Jacksonville, Florida offering an Entry Level Dental Assisting diploma and EFDA and Radiography courses approved by the Florida Board of Dentistry.",
  telephone: "+1-904-674-3131",
  email: "success@fldentalassisting.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "8761 Perimeter Park Blvd, Ste. 107",
    addressLocality: "Jacksonville",
    addressRegion: "FL",
    postalCode: "32216",
    addressCountry: "US",
  },
  areaServed: "Florida",
};

// PLACEHOLDER program data — Tom: confirm lengths, credentials, and add real FIDA program details.
const programs = [
  {
    title: "Entry Level Dental Assisting",
    length: "Diploma program",
    outcome: "Licensed by the Commission for Independent Education",
    blurb:
      "Florida&rsquo;s licensed entry path for new dental assistants. The Entry Level Dental Assisting diploma program is operated in Jacksonville, FL.",
    href: "/programs#entry-level-dental-assisting",
  },
  {
    title: "Professional Development Courses",
    length: "EFDA + Radiography",
    outcome: "Approved by the Florida Board of Dentistry",
    blurb:
      "Continuing-education courses for working dental assistants advancing their credentials. Study online; finish the clinical capstone at your own dentist&rsquo;s office.",
    href: "/programs#professional-development",
  },
];

const pillars = [
  { stat: "94%", label: "Graduate placement rate", note: "Within 6 months of completion" },
  { stat: "1:12", label: "Instructor-to-student ratio", note: "Real mentorship, not lecture halls" },
  { stat: "Hybrid", label: "Study on your schedule", note: "Online coursework with an in-office clinical capstone at your own practice" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
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
              radiography-certified, EFDA-credentialed, and clinic-ready. Explore our programs and
              figure out your next step.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/programs" className="btn-primary">
                Explore programs <span aria-hidden="true">→</span>
              </Link>
              <Link href="/portal/login" className="btn-secondary">
                I&rsquo;m already a student
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-navy-200">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal" />
                Dental Assisting Program licensed by the Commission for Independent Education.
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal" />
                EFDA and Radiography courses approved by the Florida Board of Dentistry.
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

      {/* AUDIENCE-PICKER BAND — two enrollment paths + student portal */}
      <section className="bg-white border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/programs#entry-level-dental-assisting"
              className="card card-hover block p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 font-display text-teal text-lg">
                  01
                </span>
                <div className="eyebrow">Not yet a dental assistant</div>
              </div>
              <div className="font-display text-xl text-navy mb-1">
                Entry Level Dental Assisting
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Florida&rsquo;s licensed diploma program for new dental assistants &mdash;
                operated in Jacksonville, FL. Licensed by the Commission for
                Independent Education.
              </p>
              <div className="mt-4 text-sm font-semibold text-teal">
                Explore the diploma program <span aria-hidden="true">&rarr;</span>
              </div>
            </Link>

            <Link
              href="/programs#professional-development"
              className="card card-hover block p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 font-display text-teal text-lg">
                  02
                </span>
                <div className="eyebrow">Already a working dental assistant</div>
              </div>
              <div className="font-display text-xl text-navy mb-1">
                Professional Development Courses
              </div>
              <p className="text-sm text-muted leading-relaxed">
                EFDA and Radiography continuing-education courses approved by the
                Florida Board of Dentistry &mdash; for working dental assistants
                advancing their credentials.
              </p>
              <div className="mt-4 text-sm font-semibold text-teal">
                Browse PD courses <span aria-hidden="true">&rarr;</span>
              </div>
            </Link>

            <Link
              href="/portal/login"
              className="card card-hover block p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 font-display text-teal text-lg">
                  03
                </span>
                <div className="eyebrow">Already a student</div>
              </div>
              <div className="font-display text-xl text-navy mb-1">
                Student portal
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Tickets, messages with staff, documents, and your course
                progress.
              </p>
              <div className="mt-4 text-sm font-semibold text-teal">
                Sign in <span aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* PROGRAMS PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <div className="eyebrow">Programs</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight">
              Two paths. One destination: <em className="text-teal not-italic">a real career.</em>
            </h2>
          </div>
          <Link href="/programs" className="btn-ghost">
            See all courses and programs <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    title: "Support when you need it.",
                    body: "Our team answers your questions and helps keep your enrollment on track &mdash; submit a ticket anytime and a FIDA advisor follows up.",
                  },
                  {
                    title: "Built for working adults.",
                    body: "The Entry Level Dental Assisting diploma program is operated in Jacksonville, Florida. EFDA and Radiography CE courses are hybrid &mdash; study online, finish the clinical capstone at your own dentist&rsquo;s office &mdash; under your supervising dentist&rsquo;s sign-off. Keep your job while you advance your credentials.",
                  },
                  {
                    title: "Credentials that employers trust.",
                    body: "FIDA&rsquo;s Entry Level Dental Assisting diploma program is licensed by the Florida Commission for Independent Education. The EFDA and Radiography courses are approved by the Florida Board of Dentistry.",
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
                Jacksonville-based. Online and hybrid CE schedules. Seats fill 6&ndash;8 weeks before start date.
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

            </div>
          </div>
        </div>
      </section>


      {/* ALREADY A STUDENT BAND — quick portal/support paths */}
      <section className="bg-paper-subtle border-t border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl mb-10">
            <div className="eyebrow">Already a student?</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
              Pick up where you left off.
            </h2>
            <p className="mt-4 text-muted text-lg leading-relaxed">
              Your portal has your tickets, messages from staff, and your document
              vault. Working professionals taking CE courses sign in here too.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/portal/login" className="card card-hover block p-6">
              <div className="eyebrow mb-2">Portal</div>
              <div className="font-display text-xl text-navy mb-1">Sign in</div>
              <div className="text-sm text-muted">
                Tickets, messages, documents, and CE progress.
              </div>
            </Link>
            <Link href="/tickets" className="card card-hover block p-6">
              <div className="eyebrow mb-2">Support</div>
              <div className="font-display text-xl text-navy mb-1">Open a ticket</div>
              <div className="text-sm text-muted">
                Academic, tuition, scheduling, or tech help. No sign-in needed.
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
