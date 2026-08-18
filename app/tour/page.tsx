import { TourContent } from "@/components/landing/TourContent";

export const metadata = {
  title: "Schedule a Tour — Dental Assistant School Jacksonville",
  description:
    "Tour Florida Institute of Dental Assisting in Jacksonville. Meet your instructors, see the facility, and take the first official step toward admission — the interview and tour are part of enrolling.",
  alternates: { canonical: "/tour" },
};

export default function TourPage() {
  return <TourContent />;
}
