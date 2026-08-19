import { LegalContent } from "@/components/landing/LegalContent";
import { termsPage } from "@/lib/i18n/legal";

export const metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for fldentalassisting.com — program information, enrollment agreements, acceptable use, and intellectual property.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalContent page={termsPage} />;
}
