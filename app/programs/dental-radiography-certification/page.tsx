import { CourseDetailContent } from "@/components/landing/CourseDetailContent";
import { APPLY_URL, radiographyDetail as d } from "@/lib/i18n/courseDetail";

export const metadata = {
  title: "Florida Dental Radiography Certification — Requirements & Cost",
  description:
    "Get your Florida dental radiography certification online. FIDA's Radiography for Dental Personnel course meets Florida Administrative Code 64B5-9.011. See requirements, curriculum, cost ($499), and how to enroll.",
  alternates: { canonical: "/programs/dental-radiography-certification" },
};

// Structured data stays English — search engines index the canonical English
// page; the Spanish view is the same URL, flagged via inLanguage.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Course",
      name: "Radiography for Dental Personnel",
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
      mainEntity: d.faqs.map((f) => ({
        "@type": "Question",
        name: f.q.en,
        acceptedAnswer: { "@type": "Answer", text: f.a.en },
      })),
    },
  ],
};

export default function DentalRadiographyCertificationPage() {
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
