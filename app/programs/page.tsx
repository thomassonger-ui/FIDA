import { ProgramsContent } from "@/components/landing/ProgramsContent";
import { programs } from "@/lib/i18n/programs";

export const metadata = {
  title: "Programs",
  description:
    "FIDA programs — Radiography for Dental Personnel (Florida-mandated dental radiography certification) and Expanded Functions for the Dental Assistant (EFDA certificate).",
  alternates: { canonical: "/programs" },
};

// Structured data stays English — schema.org consumers index the canonical
// English page, and the Spanish view is the same URL.
const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: programs.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Course",
      name: p.title.en,
      description: p.summary.en,
      inLanguage: ["en", "es"],
      provider: {
        "@type": "EducationalOrganization",
        name: "Florida Institute of Dental Assisting",
        sameAs: "https://fldentalassisting.online",
      },
    },
  })),
};

export default function ProgramsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <ProgramsContent />
    </>
  );
}
