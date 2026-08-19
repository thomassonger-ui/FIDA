import { LegalContent } from "@/components/landing/LegalContent";
import { accessibilityPage } from "@/lib/i18n/legal";

export const metadata = {
  title: "Accessibility Statement",
  description:
    "FIDA builds this site to WCAG 2.1 AA. How to report a barrier or request information in another format.",
  alternates: { canonical: "/accessibility" },
};

export default function Page() {
  return <LegalContent page={accessibilityPage} />;
}
