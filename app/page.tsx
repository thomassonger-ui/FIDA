import { HomeContent } from "@/components/landing/HomeContent";
import {
  EMAIL,
  MAP_URL,
  PHONE_E164,
  geoJsonLd,
  openingHoursJsonLd,
  postalAddressJsonLd,
} from "@/lib/location";

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
  url: "https://fldentalassisting.com",
  description:
    "Dental assisting school in Jacksonville, Florida offering an Entry Level Dental Assisting diploma and EFDA and Radiography courses approved by the Florida Board of Dentistry.",
  telephone: PHONE_E164,
  email: EMAIL,
  address: postalAddressJsonLd,
  geo: geoJsonLd,
  hasMap: MAP_URL,
  sameAs: [MAP_URL],
  openingHoursSpecification: openingHoursJsonLd,
  areaServed: "Florida",
  availableLanguage: ["en", "es"],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <HomeContent />
    </>
  );
}
