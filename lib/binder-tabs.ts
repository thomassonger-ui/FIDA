// Atticus Audit Binder — standard tabs and their crosswalk to CIE (Fla. Admin. Code)
// and ACCSC (Standards of Accreditation eff. 7/1/2026). Mapping pending Dr. Angley's sign-off.
// `query` drives the document search; `items` are what a reviewer expects to see in the tab.

export interface BinderTab {
  n: number;
  name: string;
  query: string;
  items: string[];
  cie: string;
  accsc: string;
}

export const BINDER_TABS: BinderTab[] = [
  { n: 1, name: "Licensure & legal",
    query: "license certificate accreditation letter articles of incorporation ownership fictitious name",
    items: ["CIE license", "Accreditation letter", "Articles / ownership documents", "Fictitious name registration"],
    cie: "6E-2.004(1), (3)", accsc: "I.A, I.F" },
  { n: 2, name: "Organization & governance",
    query: "organizational chart board minutes owner meeting administrator resume policy manual",
    items: ["Organizational chart", "Owner / board minutes", "Administrator résumés", "Policy manual"],
    cie: "6E-2.004(3)", accsc: "I.A, III.A" },
  { n: 3, name: "Mission & effectiveness (IEP)",
    query: "mission statement institutional effectiveness plan survey results analysis improvement",
    items: ["Mission statement", "Institutional Effectiveness Plan", "Survey results (student, graduate, employer, faculty)", "Analysis and improvement minutes"],
    cie: "6E-2.004(2)", accsc: "I.B" },
  { n: 4, name: "Programs & curricula",
    query: "program syllabus curriculum clock hours program approval advisory committee externship agreement",
    items: ["Approved program list", "Syllabi", "Program hours", "Program approval history", "Advisory committee minutes", "Externship agreements"],
    cie: "6E-2.004(4); 6E-2.0041", accsc: "II.A" },
  { n: 5, name: "Faculty & staff files",
    query: "faculty transcript license resume work experience professional development evaluation qualifications",
    items: ["Faculty transcripts", "Faculty licenses", "CVs and experience verification", "Professional development logs", "Evaluations", "Qualifications matrix"],
    cie: "6E-2.004(7)", accsc: "III.B" },
  { n: 6, name: "Recruitment & admissions",
    query: "admissions policy requirements high school diploma verification ability to benefit recruiter training",
    items: ["Admissions policy", "Diploma / ATB verification procedure", "Recruiter training records"],
    cie: "6E-2.004(5)", accsc: "IV.A, V" },
  { n: 7, name: "Catalog, agreement & disclosures",
    query: "school catalog enrollment agreement disclosures complaint notice commission for independent education",
    items: ["Current catalog", "Prior catalog versions", "Enrollment agreement", "Required disclosures", "CIE complaint notice"],
    cie: "6E-2.004(11), (12); 6E-1.0032", accsc: "IV.C" },
  { n: 8, name: "Advertising",
    query: "advertisement marketing website social media brochure claims",
    items: ["Advertising samples", "Website captures", "Social media posts"],
    cie: "6E-2.004(11); 6E-1.0032", accsc: "IV.B" },
  { n: 9, name: "Finances, tuition & refunds",
    query: "financial statements audit tuition schedule refund policy cancellation refund calculation",
    items: ["Audited financial statements", "Tuition schedule", "Refund and cancellation policy", "Refund calculations and timeliness"],
    cie: "6E-2.004(6)", accsc: "I.C, I.D" },
  { n: 10, name: "Student files (sample)",
    query: "student file enrollment attendance grades satisfactory academic progress transcript ledger",
    items: ["Signed enrollment agreements", "Attendance records", "Grades and SAP", "Transcripts", "Student ledgers"],
    cie: "6E-2.004(10)", accsc: "VI.B, VII.A" },
  { n: 11, name: "Outcomes",
    query: "completion rate placement rate licensure exam pass rate graduate employment verification",
    items: ["Completion rates", "Placement rates", "Licensure pass rates", "Backup documentation per graduate"],
    cie: "6E-2.004(12)", accsc: "VI.C, VII.B" },
  { n: 12, name: "Student services & complaints",
    query: "student services advising career services grievance complaint log resolution",
    items: ["Student services description", "Complaint / grievance log", "Complaint resolutions"],
    cie: "6E-2.004(10)", accsc: "VI.A, VI.D" },
  { n: 13, name: "Facilities & resources",
    query: "lease certificate of occupancy fire inspection emergency plan equipment inventory library learning resources",
    items: ["Lease", "Occupancy / fire inspection", "Emergency plan", "Equipment inventory", "Library / learning resources"],
    cie: "6E-2.004(8), (9)", accsc: "I.G, II.A.5–6" },
  { n: 14, name: "Prior reviews",
    query: "site visit report team report response corrective action annual report",
    items: ["Last visit report", "School response", "Corrective actions", "Annual reports"],
    cie: "Renewal history", accsc: "Rules of Process" },
];
