import { ContactContent } from "@/components/landing/ContactContent";
import {
  EMAIL,
  MAP_URL,
  MAP_SHARE_URL,
  PHONE_E164,
  geoJsonLd,
  openingHoursJsonLd,
  postalAddressJsonLd,
} from "@/lib/location";

export const metadata = {
  // The root layout appends " | Florida Institute of Dental Assisting".
  // Keep page titles free of the brand or it renders twice.
  title: "Contact Us",
  description:
    "Contact Florida Institute of Dental Assisting in Jacksonville: (904) 674-3131, 8761 Perimeter Park Blvd Ste. 107. Office hours Monday–Friday, 9 a.m.–3 p.m. Send a message and a staff member replies within one business day.",
  alternates: { canonical: "/contact" },
};

/**
 * Local-business markup on the page a searcher actually lands on when they
 * look for "dental assisting school near me". The homepage carries the same
 * organization; this repeats the location signals — coordinates, opening
 * hours, and the Business Profile link — where they matter most for local
 * results. Every value comes from lib/location.ts, so the markup and the
 * visible page cannot drift apart.
 */
const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": "https://fldentalassisting.com/#organization",
  name: "Florida Institute of Dental Assisting",
  alternateName: "FIDA",
  url: "https://fldentalassisting.com",
  telephone: PHONE_E164,
  email: EMAIL,
  address: postalAddressJsonLd,
  geo: geoJsonLd,
  hasMap: MAP_URL,
  sameAs: [MAP_URL, MAP_SHARE_URL],
  openingHoursSpecification: openingHoursJsonLd,
  areaServed: "Florida",
  availableLanguage: ["en", "es"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "admissions",
    telephone: PHONE_E164,
    email: EMAIL,
    areaServed: "US-FL",
    availableLanguage: ["English", "Spanish"],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactContent />
    </>
  );
}
