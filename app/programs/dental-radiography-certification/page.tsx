import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

const APPLY_URL = "https://fldentalassisting.moodlecloud.com/";
const PAGE_URL =
  "https://fldentalassisting.online/programs/dental-radiography-certification";

export const metadata = {
  title: "Florida Dental Radiography Certification — Requirements & Cost",
  description:
    "Get your Florida dental radiography certification online. FIDA's Radiography for Dental Personnel course meets Florida Administrative Code 64B5-9.011. See requirements, curriculum, cost ($499), and how to enroll.",
  alternates: { canonical: "/programs/dental-radiography-certification" },
};

const intro =
  "Radiography for Dental Personnel is the certification Florida requires before a dental assistant can position and expose dental X-rays. This focused, fully online course reviews radiation health and safety, intra-oral and extra-oral imaging, and quality control — the criteria set out in Florida Administrative Code 64B5-9.011 — and finishes with a clinical competency capstone completed under your supervising dentist.";

const facts = [
  { label: "Length", value: "6 weeks · 14 clock hours (8 theory + 6 lab)" },
  { label: "Format", value: "Online — self-paced through the FIDA learning system" },
  { label: "Credential", value: "Professional Development Certificate — Florida Dental Radiography (FAC 64B5-9.011)" },
  { label: "Tuition", value: "$499.00" },
  { label: "Approval", value: "Meets Florida dental radiography certification criteria" },
  { label: "Textbook", value: "Modern Dental Assisting, 14th Ed. (Robinson, Elsevier, 2024)" },
];

const requirements = [
  "Be at least 18 years of age.",
  "Complete a minimum of 3 months of continuous on-the-job training positioning and exposing dental radiographs under a Florida-licensed dentist. Volunteer or shadowing hours do not count.",
  "Provide a signed acknowledgement from your supervising dentist confirming the three months of training.",
  "Demonstrate working competency in English, verified through FIDA's online Continuing Education Assessment course and an in-office capstone performed under your supervising dentist.",
  "Complete the online coursework along with the capstone project.",
];

const courses = [
  { code: "RHS101", title: "Foundations of Radiography, Radiographic Equipment, and Radiation Safety" },
  { code: "RHS102", title: "Dental Imaging, Dental Film, and Processing Radiographs" },
  { code: "RHS103", title: "Legal Issues, Quality Assurance, and Infection Prevention" },
  { code: "RHS104", title: "Intraoral Imaging" },
  { code: "RHS105", title: "Extraoral Imaging" },
];

const faqs = [
  {
    q: "Do dental assistants need radiography certification in Florida?",
    a: "Yes. Florida law requires dental personnel to be certified before positioning or exposing dental radiographs. FIDA's course meets the criteria in Florida Administrative Code 64B5-9.011.",
  },
  {
    q: "What are the requirements to enroll?",
    a: "You must be at least 18, have at least three months of continuous on-the-job training positioning and exposing radiographs under a Florida-licensed dentist, provide a signed acknowledgement from that dentist, and demonstrate English competency. Volunteer or shadowing hours do not count.",
  },
  {
    q: "How much does dental radiography certification cost in Florida?",
    a: "FIDA's Radiography for Dental Personnel course tuition is $499.00.",
  },
  {
    q: "How long does the radiography course take?",
    a: "Six weeks — 14 clock hours (8 hours of theory plus 6 lab hours), completed online and self-paced.",
  },
  {
    q: "Is the course online?",
    a: "Yes. The coursework is delivered online and self-paced through the FIDA learning system, with a clinical competency capstone completed under your supervising dentist.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "Radiography for Dental Personnel",
      description: intro,
      provider: {
        "@type": "EducationalOrganization",
        name: "Florida Institute of Dental Assisting",
        sameAs: "https://fldentalassisting.online",
      },
      url: PAGE_URL,
      offers: {
        "@type": "Offer",
        category: "Tuition",
        price: "499.00",
        priceCurrency: "USD",
        url: APPLY_URL,
        availability: "https://schema.org/InStock",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT14H",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function DentalRadiographyCertificationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">

      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="eyebrow">Continuing Education · Florida</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.05]">
              Florida Dental Radiography Certification
            </h1>
            <p className="mt-6 text-muted text-lg leading-relaxed">{intro}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/admissions" className="btn-primary">
                Talk to Atticus <span aria-hidden="true">→</span>
              </Link>
              <a
                href={APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Apply now
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facts.map((f) => (
            <div key={f.label} className="card bg-white p-6">
              <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                {f.label}
              </div>
              <div className="mt-2 text-navy">{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-subtle border-y border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="eyebrow">Before you enroll</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
              Radiography enrollment requirements
            </h2>
            <ul className="mt-8 space-y-4">
              {requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-navy">
                  <span className="mt-1.5 w-5 h-5 rounded-full bg-teal/15 border border-teal/40 flex items-center justify-center flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                  </span>
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
        <div className="max-w-3xl mb-8">
          <div className="eyebrow">Curriculum</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
            What you will learn
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Five modules cover radiation safety, imaging technique, and quality
            assurance — 14 clock hours of theory and lab, finishing with a clinical
            competency capstone.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((c) => (
            <div key={c.code} className="card bg-white p-4 flex items-start gap-3">
              <span className="font-mono text-xs text-teal pt-0.5">{c.code}</span>
              <span className="text-sm text-navy">{c.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-paper-subtle border-y border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="eyebrow">Cost</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                How much does dental radiography certification cost in Florida?
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                FIDA&rsquo;s Radiography for Dental Personnel course tuition is a
                flat <strong className="text-navy">$499.00</strong>. That covers the
                full online course and the clinical competency capstone. Ask Atticus
                about payment options when you start.
              </p>
            </div>
            <div className="card bg-white p-8">
              <div className="font-display text-5xl text-teal">$499</div>
              <div className="mt-1 text-sm text-muted">
                Total tuition · 6 weeks · 14 clock hours
              </div>
              <Link href="/admissions" className="btn-primary w-full mt-6">
                Start with Atticus <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
        <div className="eyebrow">Common questions</div>
        <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
          Florida dental radiography FAQ
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((f) => (
            <div key={f.q} className="card bg-white p-6">
              <h3 className="font-display text-lg text-navy leading-tight">{f.q}</h3>
              <p className="mt-3 text-muted text-sm leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl leading-tight">
            Ready to get radiography-certified?
          </h2>
          <p className="mt-4 text-navy-100 text-lg max-w-xl mx-auto">
            Talk to Atticus to confirm you meet the requirements and choose your
            start date.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/admissions" className="btn-primary">
              Talk to Atticus <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/programs"
              className="text-teal-soft hover:text-teal underline underline-offset-4 text-sm"
            >
              See all programs
            </Link>
          </div>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
