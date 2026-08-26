import { LegalContent } from "@/components/landing/LegalContent";
import { accessibilityPage } from "@/lib/i18n/legal";

export const metadata = {
  title: "Accessibility Statement",
  description:
    "The Florida Institute of Dental Assisting builds and maintains this site to WCAG 2.1 Level AA. Read our accessibility commitment, known third-party limitations, and how to report a barrier or request information in another format.",
  alternates: { canonical: "/accessibility" },
};

export default function Page() {
  return <LegalContent page={accessibilityPage} />;
}
