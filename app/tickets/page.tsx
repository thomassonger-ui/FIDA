import { TicketsContent } from "@/components/landing/TicketsContent";

export const metadata = {
  title: "Student Support",
  description:
    "Open a support ticket with the Florida Institute of Dental Assisting. Ask about enrollment, coursework, your student portal, tuition payments, or scheduling — a FIDA staff member follows up within one business day.",
  alternates: { canonical: "/tickets" },
};

export default function TicketsLandingPage() {
  return <TicketsContent />;
}
