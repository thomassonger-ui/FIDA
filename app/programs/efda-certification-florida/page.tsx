import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

const APPLY_URL = "https://fldentalassisting.moodlecloud.com/";
const PAGE_URL =
  "https://fldentalassisting.online/programs/efda-certification-florida";

export const metadata = {
  title: "EFDA Certification Florida — Requirements & Cost",
  description:
    "Earn your Expanded Functions Dental Assistant (EFDA) certificate in Florida. FIDA's EFDA course is approved by the Florida Board of Dentistry. See requirements, curriculum, cost ($1,049), and how to enroll.",
  alternates: { canonical: "/programs/efda-certification-florida" },
};

const intro =
  "The Expanded Functions for the Dental Assistant (EFDA) course prepares working dental assistants to legally perform expanded clinical procedures in a Florida dental practice. Built around the current Dental Assisting National Board (DANB) curriculum, it pairs online theory with hands-on, in-office clinical training so you apply each skill chairside under your supervising dentist — fully aligned with Florida Board of Dentistry requirements.";

const facts = [
  { label: "Length", value: "5 weeks · 20 clock hours (13 theory + 7 in-office)" },
  { label: "Format", value: "Hybrid — online theory plus in-office clinical lab" },
  { label: "Credential", value: "Professional Development Certificate — Expanded Functions Dental Assistant" },
  { label: "Tuition", value: "$1,049.00" },
  { label: "Approval", value: "Approved by the Florida Board of Dentistry" },
  { label: "Textbook", value: "Modern Dental Assisting, 14th Ed. (Robinson, Elsevier, 2024)" },
];

const requirements = [
  "Be at least 18 years of age.",
  "Complete a minimum of 3 months of continuous on-the-job chairside training under a Florida-licensed dentist. Volunteer or shadowing hours do not count.",
  "Provide a signed acknowledgement from your supervising dentist confirming the three months of training.",
  "Demonstrate working competency in English, verified through FIDA's online Continuing Education Assessment course and an in-office capstone performed under your supervising dentist.",
  "Complete the online coursework along with the capstone project.",
];

const courses = [
  { code: "EFDA101", title: "Dental Sealants" },
  { code: "EFDA102", title: "Fluoride Placement" },
  { code: "EFDA103", title: "Polishing Clinical Crowns" },
  { code: "EFDA104", title: "Liners, Bases, and Bonding Systems" },
  { code: "EFDA105", title: "Temporary Restorations" },
  { code: "EFDA106", title: "Matrices" },
  { code: "EFDA107", title: "Alginate Impressions and Study Models" },
  { code: "EFDA108", title: "Fabricating Temporary Crowns" },
  { code: "EFDA109", title: "Placing Retraction Cord" },
  { code: "EFDA110", title: "Place / Remove Periodontal Dressing" },
  { code: "EFDA111", title: "Place / Remove Dental Dam" },
  { code: "EFDA112", title: "Suture Removal" },
  { code: "EFDA113", title: "Infection Control" },
];

const faqs = [
  {
    q: "What is an EFDA in Florida?",
    a: "An Expanded Functions Dental Assistant (EFDA) is a dental assistant authorized to perform additional clinical procedures — such as placing sealants, applying fluoride, taking impressions, and placing temporary restorations — under the supervision of a licensed dentist, in line with Florida Board of Dentistry rules.",
  },
  {
    q: "What are the requirements to enroll in the EFDA course?",
    a: "You must be at least 18, have at least three months of continuous on-the-job chairside training under a Florida-licensed dentist, provide a signed acknowledgement from that dentist, and demonstrate English competency. Volunteer or shadowing hours do not count.",
  },
  {
    q: "How much does EFDA certification cost in Florida?",
    a: "FIDA's EFDA course tuition is $1,049.00, which covers the full hybrid program and capstone assessment.",
  },
  {
    q: "How long does the EFDA course take?",
    a: "Five weeks — 20 clock hours total, combining 13 hours of online theory with 7 in-office clinical hours.",
  },
  {
    q: "Is FIDA's EFDA course approved in Florida?",
    a: "Yes. The EFDA course is approved by the Florida Board of Dentistry.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "Expanded Functions for the Dental Assistant (EFDA)",
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
        price: "1049.00",
        priceCurrency: "USD",
        url: APPLY_URL,
        availability: "https://schema.org/InStock",
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "blended",
        courseWorkload: "PT20H",
        location: {
          "@type": "Place",
          name: "Florida Institute of Dental Assisting",
          address: {
            "@type": "PostalAddress",
            streetAddress: "8761 Perimeter Park Blvd, Ste. 107",
            addressLocality: "Jacksonville",
            addressRegion: "FL",
            postalCode: "32216",
            addressCountry: "US",
          },
        },
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

export default function EfdaCertificationFloridaPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="eyebrow">Continuing Education · Florida</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.05]">
              EFDA Certification in Florida — Requirements &amp; Cost
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
              EFDA enrollment requirements
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
            The EFDA course covers thirteen expanded-function procedures, totaling
            20 clock hours of theory and supervised in-office clinical practice.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c) => (
            <div key={c.code} className="card bg-white p-4 flex items-center gap-3">
              <span className="font-mono text-xs text-teal">{c.code}</span>
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
                How much does EFDA certification cost in Florida?
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                FIDA&rsquo;s EFDA course tuition is a flat{" "}
                <strong className="text-navy">$1,049.00</strong>. That covers the
                full hybrid program — online theory, the in-office clinical
                component, and your capstone assessment. Ask Atticus about payment
                options when you start.
              </p>
            </div>
            <div className="card bg-white p-8">
              <div className="font-display text-5xl text-teal">$1,049</div>
              <div className="mt-1 text-sm text-muted">
                Total tuition · 5 weeks · 20 clock hours
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
          EFDA certification FAQ
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
            Ready to add EFDA to your credentials?
          </h2>
          <p className="mt-4 text-navy-100 text-lg max-w-xl mx-auto">
            Talk to Atticus to confirm you meet the requirements and map out your
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

      <Footer />
    </div>
  );
}
