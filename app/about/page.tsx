import { AboutContent } from "@/components/landing/AboutContent";

export const metadata = {
  title: "About",
  description:
    "Florida Institute of Dental Assisting is a dental assisting school in Jacksonville, FL — an Entry Level Dental Assisting diploma plus EFDA and Radiography courses approved by the Florida Board of Dentistry.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
