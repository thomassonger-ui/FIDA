import { TuitionContent } from "@/components/landing/TuitionContent";

export const metadata = {
  title: "Tuition & Cost — Dental Assistant School Jacksonville",
  description:
    "FIDA tuition: Entry Level Dental Assisting diploma $9,850 total (books, scrubs, clinical kit, and lab fees included). EFDA $1,049 · Radiography $499 — open enrollment. No hidden fees. Interest-free payment plans available.",
  alternates: { canonical: "/tuition" },
};

/**
 * Offer markup for the three published prices. Added 2026-08-25 (Phase 3) —
 * /tuition previously carried no structured data, so the prices were invisible
 * to search engines even though the program pages had Course markup.
 *
 * Prices mirror lib/i18n/tuition.ts and lib/payment.ts. If a price changes
 * there, change it here too.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "FIDA tuition and fees",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Course",
        name: "Entry Level Dental Assisting (Diploma Program)",
        description:
          "Six-month in-person diploma program in Jacksonville, FL. $9,700 tuition plus a $150 registration fee. A $750 seat deposit applies (the registration fee counts toward it); the balance is payable on an interest-free 6- or 8-month in-house plan.",
        url: "https://fldentalassisting.com/programs/entry-level-dental-assisting",
        provider: {
          "@type": "EducationalOrganization",
          name: "Florida Institute of Dental Assisting",
          sameAs: "https://fldentalassisting.com",
        },
        offers: {
          "@type": "Offer",
          category: "Tuition",
          price: "9850.00",
          priceCurrency: "USD",
          url: "https://fldentalassisting.com/register",
          availability: "https://schema.org/InStock",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Course",
        name: "Expanded Functions for the Dental Assistant (EFDA)",
        description:
          "20 clock hours. Online theory with an in-office clinical capstone at the student's own dental practice. Approved by the Florida Board of Dentistry.",
        url: "https://fldentalassisting.com/programs/efda-certification-florida",
        provider: {
          "@type": "EducationalOrganization",
          name: "Florida Institute of Dental Assisting",
          sameAs: "https://fldentalassisting.com",
        },
        offers: {
          "@type": "Offer",
          category: "Tuition",
          price: "1049.00",
          priceCurrency: "USD",
          url: "https://fldentalassisting.com/programs/efda-certification-florida",
          availability: "https://schema.org/InStock",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Course",
        name: "Radiography for Dental Personnel",
        description:
          "14 clock hours, self-paced online. Florida-required certification for dental personnel operating X-ray equipment. Approved by the Florida Board of Dentistry.",
        url: "https://fldentalassisting.com/programs/dental-radiography-certification",
        provider: {
          "@type": "EducationalOrganization",
          name: "Florida Institute of Dental Assisting",
          sameAs: "https://fldentalassisting.com",
        },
        offers: {
          "@type": "Offer",
          category: "Tuition",
          price: "499.00",
          priceCurrency: "USD",
          url: "https://fldentalassisting.com/programs/dental-radiography-certification",
          availability: "https://schema.org/InStock",
        },
      },
    },
  ],
};

export default function TuitionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TuitionContent />
    </>
  );
}
