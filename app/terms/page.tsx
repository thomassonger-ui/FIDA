import { LegalContent } from "@/components/landing/LegalContent";
import { termsPage } from "@/lib/i18n/legal";

export const metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for fldentalassisting.com — how program information is published, how enrollment agreements control, licensure and employment disclaimers, acceptable use of this site, and intellectual property.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <LegalContent page={termsPage} />;
}
