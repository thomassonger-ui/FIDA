import { LegalContent } from "@/components/landing/LegalContent";
import { refundPage } from "@/lib/i18n/legal";

export const metadata = {
  title: "Tuition, Cancellation & Refunds",
  description:
    "Where FIDA's cancellation and refund terms live, the non-refundable registration fee, and how to request a cancellation or contact the Florida Commission for Independent Education.",
  alternates: { canonical: "/refund-policy" },
};

export default function Page() {
  return <LegalContent page={refundPage} />;
}
