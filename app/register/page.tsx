import { RegisterContent } from "@/components/landing/RegisterContent";
import { COHORT_DATE_EN } from "@/lib/cohort";

export const metadata = {
  title: "Register — Entry Level Dental Assisting | FIDA Jacksonville",
  description:
    "Secure your seat in FIDA's Entry Level Dental Assisting diploma program: apply through Atticus, then pay the $150 registration fee online. Next class starts " +
    COHORT_DATE_EN +
    ".",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return <RegisterContent />;
}
