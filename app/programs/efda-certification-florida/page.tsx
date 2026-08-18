import { CourseDetailContent } from "@/components/landing/CourseDetailContent";
import { APPLY_URL, efdaDetail as d } from "@/lib/i18n/courseDetail";

export const metadata = {
  title: "EFDA Certification Florida — Requirements & Cost",
  description:
    "Earn your Expanded Functions Dental Assistant (EFDA) certificate in Florida. FIDA's EFDA course is approved by the Florida Board of Dentistry. See requirements, curriculum, cost ($1,049), and how to enroll.",
  alternates: { canonical: "/programs/efda-certification-florida" },
};

// Structured data stays English — search engines index the canonical English
// page; the Spanish view is the same URL, flagged via inLanguage.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "Expanded Functions for the Dental Assistant (EFDA)",
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
      mainEntity: d.faqs.map((f) => ({
        "@type": "Question",
        name: f.q.en,
        acceptedAnswer: { "@type": "Answer", text: f.a.en },
      })),
    },
  ],
};

export default function EfdaCertificationFloridaPage() {
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
