import { ContactContent } from "@/components/landing/ContactContent";

export const metadata = {
  title: "Contact FIDA — Florida Institute of Dental Assisting",
  description:
    "Contact Florida Institute of Dental Assisting in Jacksonville: (904) 674-3131, 8761 Perimeter Park Blvd Ste. 107. Office hours 9 a.m.–3 p.m. Send a message and a staff member replies within one business day.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
