import { HomeContent } from "@/components/landing/HomeContent";

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
