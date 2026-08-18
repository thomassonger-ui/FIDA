import type { Bilingual } from "./LanguageProvider";

/**
 * EN/ES copy for the two SEO course-detail pages:
 *   /programs/efda-certification-florida
 *   /programs/dental-radiography-certification
 *
 * The English strings here are also the source for each page's metadata and
 * JSON-LD (see the route files), so keep `.en` intact — search engines index
 * the canonical English page and the Spanish view lives at the same URL.
 *
 * COMPLIANCE: regulatory phrases carry the approved English verbatim in
 * parentheses on the Spanish side. See lib/i18n/home.ts for the full rule.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

export const APPLY_URL = "https://fldentalassisting.moodlecloud.com/";

export type DetailCourse = { code: string; title: Bilingual };
export type DetailFaq = { q: Bilingual; a: Bilingual };

export type CourseDetail = {
  slug: string;
  pageUrl: string;
  /**
   * Where the Apply CTA points. Defaults to APPLY_URL (Moodle, new tab).
   * The Entry Level diploma page overrides this to the Atticus intake
   * (internal route, same tab) — Apply Now = /atticus per Tom 2026-08-18.
   */
  applyHref?: string;
  /** Optional social proof block rendered between Facts and Requirements. */
  testimonial?: { quote: Bilingual; name: Bilingual };
  eyebrow: Bilingual;
  h1: Bilingual;
  intro: Bilingual;
  applyNow: Bilingual;
  getStarted: Bilingual;
  facts: { label: Bilingual; value: Bilingual }[];
  requirementsEyebrow: Bilingual;
  requirementsHeading: Bilingual;
  requirements: Bilingual[];
  curriculumEyebrow: Bilingual;
  curriculumHeading: Bilingual;
  curriculumBody: Bilingual;
  courses: DetailCourse[];
  costEyebrow: Bilingual;
  costHeading: Bilingual;
  costBody: Bilingual;
  priceDisplay: string;
  priceNote: Bilingual;
  faqEyebrow: Bilingual;
  faqHeading: Bilingual;
  faqs: DetailFaq[];
  ctaHeading: Bilingual;
  ctaBody: Bilingual;
  ctaSeeAll: Bilingual;
};

const shared = {
  eyebrow: b("Continuing Education · Florida", "Educación Continua · Florida"),
  applyNow: b("Apply now", "Inscribirse ahora"),
  getStarted: b("Get started", "Comenzar"),
  requirementsEyebrow: b("Before you enroll", "Antes de inscribirte"),
  curriculumEyebrow: b("Curriculum", "Plan de estudios"),
  curriculumHeading: b("What you will learn", "Lo que aprenderás"),
  costEyebrow: b("Cost", "Costo"),
  faqEyebrow: b("Common questions", "Preguntas frecuentes"),
  ctaSeeAll: b("See all programs", "Ver todos los programas"),
  factLabels: {
    length: b("Length", "Duración"),
    format: b("Format", "Formato"),
    credential: b("Credential", "Credencial"),
    tuition: b("Tuition", "Matrícula"),
    approval: b("Approval", "Aprobación"),
    textbook: b("Textbook", "Libro de texto"),
  },
};

export const detailUi = shared;

const englishCompetency = b(
  "Demonstrate working competency in English, verified through FIDA's online Continuing Education Assessment course and an in-office capstone performed under your supervising dentist.",
  "Demostrar competencia funcional en inglés (working competency in English), verificada mediante el curso en línea de Evaluación de Educación Continua de FIDA y una práctica final en el consultorio realizada bajo tu dentista supervisor.",
);

const capstone = b(
  "Complete the online coursework along with the capstone project.",
  "Completar el curso en línea junto con el proyecto final (complete the online coursework with capstone project).",
);

const signedAck = b(
  "Provide a signed acknowledgement from your supervising dentist confirming the three months of training.",
  "Presentar una constancia firmada por tu dentista supervisor que confirme los tres meses de capacitación.",
);

const age18 = b("Be at least 18 years of age.", "Tener al menos 18 años de edad.");

const textbook = b(
  "Modern Dental Assisting, 14th Ed. (Robinson, Elsevier, 2024)",
  "Modern Dental Assisting, 14.ª ed. (Robinson, Elsevier, 2024)",
);

export const efdaDetail: CourseDetail = {
  slug: "efda-certification-florida",
  pageUrl:
    "https://fldentalassisting.com/programs/efda-certification-florida",
  eyebrow: shared.eyebrow,
  h1: b(
    "EFDA Certification in Florida — Requirements & Cost",
    "Certificación EFDA en Florida: requisitos y costo",
  ),
  intro: b(
    "The Expanded Functions for the Dental Assistant (EFDA) course prepares working dental assistants to legally perform expanded clinical procedures in a Florida dental practice. Built around the current Dental Assisting National Board (DANB) curriculum, it pairs online theory with hands-on, in-office clinical training so you apply each skill chairside under your supervising dentist — fully aligned with Florida Board of Dentistry requirements.",
    "El curso de Funciones Ampliadas para el Asistente Dental (EFDA) prepara a los asistentes dentales en ejercicio para realizar legalmente procedimientos clínicos ampliados en un consultorio de Florida. Estructurado en torno al plan de estudios vigente del Dental Assisting National Board (DANB), combina teoría en línea con práctica clínica en el consultorio para que apliques cada destreza junto al sillón bajo tu dentista supervisor, en plena alineación con los requisitos de la Junta de Odontología de Florida (Florida Board of Dentistry requirements).",
  ),
  applyNow: shared.applyNow,
  getStarted: shared.getStarted,
  facts: [
    {
      label: shared.factLabels.length,
      value: b(
        "5 weeks · 20 clock hours (13 theory + 7 in-office)",
        "5 semanas · 20 horas reloj (13 de teoría + 7 en el consultorio)",
      ),
    },
    {
      label: shared.factLabels.format,
      value: b(
        "Hybrid — online theory plus in-office clinical lab",
        "Híbrido — teoría en línea más laboratorio clínico en el consultorio",
      ),
    },
    {
      label: shared.factLabels.credential,
      value: b(
        "Professional Development Certificate — Expanded Functions Dental Assistant",
        "Certificado de Desarrollo Profesional (Professional Development Certificate) — Asistente Dental de Funciones Ampliadas",
      ),
    },
    { label: shared.factLabels.tuition, value: b("$1,049.00", "$1,049.00") },
    {
      label: shared.factLabels.approval,
      value: b(
        "Approved by the Florida Board of Dentistry",
        "Aprobado por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry)",
      ),
    },
    { label: shared.factLabels.textbook, value: textbook },
  ],
  requirementsEyebrow: shared.requirementsEyebrow,
  requirementsHeading: b(
    "EFDA enrollment requirements",
    "Requisitos de inscripción para EFDA",
  ),
  requirements: [
    age18,
    b(
      "Complete a minimum of 3 months of continuous on-the-job chairside training under a Florida-licensed dentist. Volunteer or shadowing hours do not count.",
      "Completar un mínimo de 3 meses de capacitación continua en el trabajo junto al sillón dental bajo un dentista con licencia de Florida. Las horas de voluntariado u observación no cuentan.",
    ),
    signedAck,
    englishCompetency,
    capstone,
  ],
  curriculumEyebrow: shared.curriculumEyebrow,
  curriculumHeading: shared.curriculumHeading,
  curriculumBody: b(
    "The EFDA course covers thirteen expanded-function procedures, totaling 20 clock hours of theory and supervised in-office clinical practice.",
    "El curso EFDA abarca trece procedimientos de funciones ampliadas, con un total de 20 horas reloj de teoría y práctica clínica supervisada en el consultorio.",
  ),
  courses: [
    { code: "EFDA101", title: b("Dental Sealants", "Selladores dentales") },
    { code: "EFDA102", title: b("Fluoride Placement", "Aplicación de flúor") },
    { code: "EFDA103", title: b("Polishing Clinical Crowns", "Pulido de coronas clínicas") },
    { code: "EFDA104", title: b("Liners, Bases, and Bonding Systems", "Forros, bases y sistemas adhesivos") },
    { code: "EFDA105", title: b("Temporary Restorations", "Restauraciones temporales") },
    { code: "EFDA106", title: b("Matrices", "Matrices") },
    { code: "EFDA107", title: b("Alginate Impressions and Study Models", "Impresiones de alginato y modelos de estudio") },
    { code: "EFDA108", title: b("Fabricating Temporary Crowns", "Fabricación de coronas temporales") },
    { code: "EFDA109", title: b("Placing Retraction Cord", "Colocación de hilo retractor") },
    { code: "EFDA110", title: b("Place / Remove Periodontal Dressing", "Colocar / retirar apósito periodontal") },
    { code: "EFDA111", title: b("Place / Remove Dental Dam", "Colocar / retirar dique de goma") },
    { code: "EFDA112", title: b("Suture Removal", "Retiro de suturas") },
    { code: "EFDA113", title: b("Infection Control", "Control de infecciones") },
  ],
  costEyebrow: shared.costEyebrow,
  costHeading: b(
    "How much does EFDA certification cost in Florida?",
    "¿Cuánto cuesta la certificación EFDA en Florida?",
  ),
  costBody: b(
    "FIDA’s EFDA course tuition is a flat $1,049.00. That covers the full hybrid program — online theory, the in-office clinical component, and your capstone assessment. Ask us about payment options when you start.",
    "La matrícula del curso EFDA de FIDA es de $1,049.00 en total. Cubre el programa híbrido completo: la teoría en línea, el componente clínico en el consultorio y tu evaluación final. Pregúntanos por las opciones de pago cuando comiences.",
  ),
  priceDisplay: "$1,049",
  priceNote: b(
    "Total tuition · 5 weeks · 20 clock hours",
    "Matrícula total · 5 semanas · 20 horas reloj",
  ),
  faqEyebrow: shared.faqEyebrow,
  faqHeading: b("EFDA certification FAQ", "Preguntas frecuentes sobre la certificación EFDA"),
  faqs: [
    {
      q: b("What is an EFDA in Florida?", "¿Qué es un EFDA en Florida?"),
      a: b(
        "An Expanded Functions Dental Assistant (EFDA) is a dental assistant authorized to perform additional clinical procedures — such as placing sealants, applying fluoride, taking impressions, and placing temporary restorations — under the supervision of a licensed dentist, in line with Florida Board of Dentistry rules.",
        "Un Asistente Dental de Funciones Ampliadas (EFDA) es un asistente dental autorizado a realizar procedimientos clínicos adicionales —como colocar selladores, aplicar flúor, tomar impresiones y colocar restauraciones temporales— bajo la supervisión de un dentista con licencia, conforme a las reglas de la Junta de Odontología de Florida (Florida Board of Dentistry rules).",
      ),
    },
    {
      q: b(
        "What are the requirements to enroll in the EFDA course?",
        "¿Cuáles son los requisitos para inscribirse en el curso EFDA?",
      ),
      a: b(
        "You must be at least 18, have at least three months of continuous on-the-job chairside training under a Florida-licensed dentist, provide a signed acknowledgement from that dentist, and demonstrate English competency. Volunteer or shadowing hours do not count.",
        "Debes tener al menos 18 años, contar con un mínimo de tres meses de capacitación continua junto al sillón bajo un dentista con licencia de Florida, presentar una constancia firmada por ese dentista y demostrar competencia en inglés. Las horas de voluntariado u observación no cuentan.",
      ),
    },
    {
      q: b(
        "How much does EFDA certification cost in Florida?",
        "¿Cuánto cuesta la certificación EFDA en Florida?",
      ),
      a: b(
        "FIDA's EFDA course tuition is $1,049.00, which covers the full hybrid program and capstone assessment.",
        "La matrícula del curso EFDA de FIDA es de $1,049.00 e incluye el programa híbrido completo y la evaluación final.",
      ),
    },
    {
      q: b("How long does the EFDA course take?", "¿Cuánto dura el curso EFDA?"),
      a: b(
        "Five weeks — 20 clock hours total, combining 13 hours of online theory with 7 in-office clinical hours.",
        "Cinco semanas: 20 horas reloj en total, que combinan 13 horas de teoría en línea con 7 horas clínicas en el consultorio.",
      ),
    },
    {
      q: b(
        "Is FIDA's EFDA course approved in Florida?",
        "¿Está aprobado el curso EFDA de FIDA en Florida?",
      ),
      a: b(
        "Yes. The EFDA course is approved by the Florida Board of Dentistry.",
        "Sí. El curso EFDA está aprobado por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry).",
      ),
    },
  ],
  ctaHeading: b(
    "Ready to add EFDA to your credentials?",
    "¿Listo para sumar el EFDA a tus credenciales?",
  ),
  ctaBody: b(
    "Get in touch to confirm you meet the requirements and map out your start date.",
    "Contáctanos para confirmar que cumples los requisitos y planificar tu fecha de inicio.",
  ),
  ctaSeeAll: shared.ctaSeeAll,
};

export const radiographyDetail: CourseDetail = {
  slug: "dental-radiography-certification",
  pageUrl:
    "https://fldentalassisting.com/programs/dental-radiography-certification",
  eyebrow: shared.eyebrow,
  h1: b(
    "Florida Dental Radiography Certification",
    "Certificación en Radiografía Dental de Florida",
  ),
  intro: b(
    "Radiography for Dental Personnel is the certification Florida requires before a dental assistant can position and expose dental X-rays. This focused, fully online course reviews radiation health and safety, intra-oral and extra-oral imaging, and quality control — the criteria set out in Florida Administrative Code 64B5-9.011 — and finishes with a clinical competency capstone completed under your supervising dentist.",
    "Radiografía para Personal Dental es la certificación que Florida exige antes de que un asistente dental pueda posicionar y tomar radiografías dentales. Este curso enfocado y totalmente en línea repasa la salud y seguridad radiológica, la imagenología intraoral y extraoral, y el control de calidad —los criterios establecidos en el Código Administrativo de Florida 64B5-9.011— y concluye con una práctica final de competencia clínica realizada bajo tu dentista supervisor.",
  ),
  applyNow: shared.applyNow,
  getStarted: shared.getStarted,
  facts: [
    {
      label: shared.factLabels.length,
      value: b(
        "6 weeks · 14 clock hours (8 theory + 6 lab)",
        "6 semanas · 14 horas reloj (8 de teoría + 6 de laboratorio)",
      ),
    },
    {
      label: shared.factLabels.format,
      value: b(
        "Online — self-paced through the FIDA learning system",
        "En línea — a tu propio ritmo mediante la plataforma de aprendizaje de FIDA",
      ),
    },
    {
      label: shared.factLabels.credential,
      value: b(
        "Professional Development Certificate — Florida Dental Radiography (FAC 64B5-9.011)",
        "Certificado de Desarrollo Profesional (Professional Development Certificate) — Radiografía Dental de Florida (FAC 64B5-9.011)",
      ),
    },
    { label: shared.factLabels.tuition, value: b("$499.00", "$499.00") },
    {
      label: shared.factLabels.approval,
      value: b(
        "Meets Florida dental radiography certification criteria",
        "Cumple los criterios de certificación en radiografía dental de Florida (meets Florida dental radiography certification criteria)",
      ),
    },
    { label: shared.factLabels.textbook, value: textbook },
  ],
  requirementsEyebrow: shared.requirementsEyebrow,
  requirementsHeading: b(
    "Radiography enrollment requirements",
    "Requisitos de inscripción para Radiografía",
  ),
  requirements: [
    age18,
    b(
      "Complete a minimum of 3 months of continuous on-the-job training positioning and exposing dental radiographs under a Florida-licensed dentist. Volunteer or shadowing hours do not count.",
      "Completar un mínimo de 3 meses de capacitación continua en el trabajo posicionando y tomando radiografías dentales bajo un dentista con licencia de Florida. Las horas de voluntariado u observación no cuentan.",
    ),
    signedAck,
    englishCompetency,
    capstone,
  ],
  curriculumEyebrow: shared.curriculumEyebrow,
  curriculumHeading: shared.curriculumHeading,
  curriculumBody: b(
    "The course covers five modules totaling 14 clock hours of theory and lab, completed online and self-paced.",
    "El curso abarca cinco módulos con un total de 14 horas reloj de teoría y laboratorio, que se completan en línea y a tu propio ritmo.",
  ),
  courses: [
    { code: "RHS101", title: b("Foundations of Radiography, Radiographic Equipment, and Radiation Safety", "Fundamentos de la radiografía, equipo radiográfico y seguridad radiológica") },
    { code: "RHS102", title: b("Dental Imaging, Dental Film, and Processing Radiographs", "Imagenología dental, película dental y procesamiento de radiografías") },
    { code: "RHS103", title: b("Legal Issues, Quality Assurance, and Infection Prevention", "Aspectos legales, garantía de calidad y prevención de infecciones") },
    { code: "RHS104", title: b("Intraoral Imaging", "Imagenología intraoral") },
    { code: "RHS105", title: b("Extraoral Imaging", "Imagenología extraoral") },
  ],
  costEyebrow: shared.costEyebrow,
  costHeading: b(
    "How much does dental radiography certification cost in Florida?",
    "¿Cuánto cuesta la certificación en radiografía dental en Florida?",
  ),
  costBody: b(
    "FIDA’s Radiography for Dental Personnel course tuition is a flat $499.00. That covers the full online course and the clinical competency capstone. Ask us about payment options when you start.",
    "La matrícula del curso Radiografía para Personal Dental de FIDA es de $499.00 en total. Cubre el curso completo en línea y la práctica final de competencia clínica. Pregúntanos por las opciones de pago cuando comiences.",
  ),
  priceDisplay: "$499",
  priceNote: b(
    "Total tuition · 6 weeks · 14 clock hours",
    "Matrícula total · 6 semanas · 14 horas reloj",
  ),
  faqEyebrow: shared.faqEyebrow,
  faqHeading: b(
    "Florida dental radiography FAQ",
    "Preguntas frecuentes sobre radiografía dental en Florida",
  ),
  faqs: [
    {
      q: b(
        "Do dental assistants need radiography certification in Florida?",
        "¿Los asistentes dentales necesitan certificación en radiografía en Florida?",
      ),
      a: b(
        "Yes. Florida law requires dental personnel to be certified before positioning or exposing dental radiographs. FIDA's course meets the criteria in Florida Administrative Code 64B5-9.011.",
        "Sí. La ley de Florida exige que el personal dental esté certificado antes de posicionar o tomar radiografías dentales. El curso de FIDA cumple los criterios del Código Administrativo de Florida 64B5-9.011.",
      ),
    },
    {
      q: b("What are the requirements to enroll?", "¿Cuáles son los requisitos para inscribirse?"),
      a: b(
        "You must be at least 18, have at least three months of continuous on-the-job training positioning and exposing radiographs under a Florida-licensed dentist, provide a signed acknowledgement from that dentist, and demonstrate English competency. Volunteer or shadowing hours do not count.",
        "Debes tener al menos 18 años, contar con un mínimo de tres meses de capacitación continua en el trabajo posicionando y tomando radiografías bajo un dentista con licencia de Florida, presentar una constancia firmada por ese dentista y demostrar competencia en inglés. Las horas de voluntariado u observación no cuentan.",
      ),
    },
    {
      q: b(
        "How much does dental radiography certification cost in Florida?",
        "¿Cuánto cuesta la certificación en radiografía dental en Florida?",
      ),
      a: b(
        "FIDA's Radiography for Dental Personnel course tuition is $499.00.",
        "La matrícula del curso Radiografía para Personal Dental de FIDA es de $499.00.",
      ),
    },
    {
      q: b("How long does the radiography course take?", "¿Cuánto dura el curso de radiografía?"),
      a: b(
        "Six weeks — 14 clock hours (8 hours of theory plus 6 lab hours), completed online and self-paced.",
        "Seis semanas: 14 horas reloj (8 horas de teoría más 6 horas de laboratorio), que se completan en línea y a tu propio ritmo.",
      ),
    },
    {
      q: b("Is the course online?", "¿El curso es en línea?"),
      a: b(
        "Yes. The coursework is delivered online and self-paced through the FIDA learning system, with a clinical competency capstone completed under your supervising dentist.",
        "Sí. El curso se imparte en línea y a tu propio ritmo mediante la plataforma de aprendizaje de FIDA, con una práctica final de competencia clínica realizada bajo tu dentista supervisor.",
      ),
    },
  ],
  ctaHeading: b(
    "Ready to get radiography-certified?",
    "¿Listo para certificarte en radiografía?",
  ),
  ctaBody: b(
    "Get in touch to confirm you meet the requirements and choose your start date.",
    "Contáctanos para confirmar que cumples los requisitos y elegir tu fecha de inicio.",
  ),
  ctaSeeAll: shared.ctaSeeAll,
};
