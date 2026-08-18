import { CourseDetailContent } from "@/components/landing/CourseDetailContent";
import { COHORT_DATE_EN } from "@/lib/cohort";
import { entryLevelDetail as d } from "@/lib/i18n/entryLevelDetail";

export const metadata = {
  title: "Entry Level Dental Assisting Diploma — Jacksonville, FL",
  description:
    "Become a dental assistant in 6 months at Florida Institute of Dental Assisting in Jacksonville. 142 theory + 76 lab + 160 externship hours, CIE-licensed diploma, $9,850 total tuition. Next cohort: " +
    COHORT_DATE_EN +
    ".",
  alternates: { canonical: "/programs/entry-level-dental-assisting" },
};

// Structured data stays English — search engines index the canonical English
// page; the Spanish view is the same URL, flagged via inLanguage.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "Entry Level Dental Assisting (Diploma Program)",
      description: d.intro.en,
      inLanguage: ["en", "es"],
      provider: {
        "@type": "EducationalOrganization",
        name: "Florida Institute of Dental Assisting",
        sameAs: "https://fldentalassisting.com",
      },
      url: d.pageUrl,
      offers: {
        "@type": "Offer",
        category: "Tuition",
        price: "9850.00",
        priceCurrency: "USD",
        url: "https://fldentalassisting.com/atticus",
        availability: "https://schema.org/InStock",
      },
      educationalCredentialAwarded: "Diploma — Entry Level Dental Assisting",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "onsite",
        courseWorkload: "P6M",
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
      mainEntity: d.faqs.map((f) => ({
        "@type": "Question",
        name: f.q.en,
        acceptedAnswer: { "@type": "Answer", text: f.a.en },
      })),
    },
  ],
};

export default function EntryLevelDentalAssistingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailContent d={d} />
    </>
  );
}
