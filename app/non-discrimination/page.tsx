import { LegalContent } from "@/components/landing/LegalContent";
import { nonDiscriminationPage } from "@/lib/i18n/legal";

export const metadata = {
  title: "Non-Discrimination Policy",
  description:
    "Florida Institute of Dental Assisting admits students without regard to race, color, national origin, sex, age, or disability, and applies admission requirements equally.",
  alternates: { canonical: "/non-discrimination" },
};

export default function Page() {
  return <LegalContent page={nonDiscriminationPage} />;
}
