import type { Source } from "./types";

/**
 * Every primary source the blog cites, in one place, so a rule change means
 * one edit. Prefer the regulator's own page over any summary of it.
 *
 * Last checked against the live pages: 2026-09-18.
 */
export const SOURCES: Record<string, Source> = {
  "rule-9011": {
    title: "Rule 64B5-9.011, F.A.C. — Radiography Training for Dental Assistants",
    publisher: "Florida Administrative Code",
    url: "https://flrules.org/gateway/ruleNo.asp?id=64B5-9.011",
  },
  "rule-16001": {
    title: "Rule 64B5-16.001, F.A.C. — Definitions of Remediable Tasks and Supervision Levels",
    publisher: "Florida Administrative Code",
    url: "https://flrules.org/gateway/ruleNo.asp?id=64B5-16.001",
  },
  "rule-16002": {
    title: "Rule 64B5-16.002, F.A.C. — Required Training",
    publisher: "Florida Administrative Code",
    url: "https://flrules.org/gateway/ruleNo.asp?id=64B5-16.002",
  },
  "rule-16005": {
    title: "Rule 64B5-16.005, F.A.C. — Remediable Tasks Delegable to Dental Assistants",
    publisher: "Florida Administrative Code",
    url: "https://flrules.org/gateway/ruleNo.asp?id=64B5-16.005",
  },
  "rule-16006": {
    title: "Rule 64B5-16.006, F.A.C. — Remediable Tasks Delegable to a Dental Hygienist",
    publisher: "Florida Administrative Code",
    url: "https://flrules.org/gateway/ruleNo.asp?id=64B5-16.006",
  },
  "chapter-16": {
    title: "Chapter 64B5-16, F.A.C. — Remediable Tasks Delegable to Dental Hygienists and Dental Assistants",
    publisher: "Florida Administrative Code",
    url: "https://flrules.org/gateway/ChapterHome.asp?Chapter=64B5-16",
  },
  "stat-466017": {
    title: "Section 466.017(7), Florida Statutes — Prescription of drugs; anesthesia (dental X-ray provision)",
    publisher: "The Florida Legislature — Online Sunshine",
    url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0466/Sections/0466.017.html",
  },
  "stat-466024": {
    title: "Section 466.024, Florida Statutes — Delegation of duties; expanded functions",
    publisher: "The Florida Legislature — Online Sunshine",
    url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0466/Sections/0466.024.html",
  },
  "stat-466028": {
    title: "Section 466.028, Florida Statutes — Grounds for disciplinary action",
    publisher: "The Florida Legislature — Online Sunshine",
    url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0466/Sections/0466.028.html",
  },
  "board-radiographer": {
    title: "Dental Radiographer — Licensing requirements, process and fees",
    publisher: "Florida Board of Dentistry",
    url: "https://floridasdentistry.gov/licensing/dental-radiographer/",
  },
  "board-radiographer-renewal": {
    title: "Dental Radiographer — renewal and continuing education information",
    publisher: "Florida Board of Dentistry",
    url: "https://floridasdentistry.gov/tag/dental-radiographer/",
  },
  "board-app": {
    title: "Dental Radiography Certification Application, Form DH-MQA 1202 (Rev. 8/2025)",
    publisher: "Florida Department of Health, Board of Dentistry",
    url: "https://floridasdentistry.gov/Applications/dental-radiographer-app.pdf",
  },
  "board-hb975": {
    title: "HB 975's New Background Screening Requirement",
    publisher: "Florida Board of Dentistry",
    url: "https://floridasdentistry.gov/hb-975s-new-background-screening-requirement/",
  },
  "board-resources": {
    title: "Resources — Helpful Links, including the List of Board Approved Expanded Duty/Dental Radiography Programs",
    publisher: "Florida Board of Dentistry",
    url: "https://floridasdentistry.gov/resources/",
  },
  "board-programs-2023": {
    title: "Florida State Board of Dentistry Approved Expanded Duty/Radiology Programs (updated June 13, 2023)",
    publisher: "Florida Board of Dentistry",
    url: "https://floridasdentistry.gov/Forms/ExpDutyPrograms_June_13_2023.pdf",
  },
  "doh-verify": {
    title: "License Verification — search for a health care practitioner or certificate holder",
    publisher: "Florida Department of Health, Division of Medical Quality Assurance",
    url: "https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthCareProviders",
  },
  cie: {
    title: "Commission for Independent Education",
    publisher: "Florida Department of Education",
    url: "https://www.fldoe.org/policy/cie/",
  },
};
