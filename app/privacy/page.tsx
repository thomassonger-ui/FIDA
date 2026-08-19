import { LegalContent } from "@/components/landing/LegalContent";
import { privacyPage } from "@/lib/i18n/legal";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Florida Institute of Dental Assisting collects, uses, and protects your information — Atticus AI chat, contact forms, tour requests, and the student portal.",
  alternates: { canonical: "/privacy" },
};

export default function Page() {
  return <LegalContent page={privacyPage} />;
}
