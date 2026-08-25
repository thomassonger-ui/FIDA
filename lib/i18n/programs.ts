import type { Bilingual } from "./LanguageProvider";

/**
 * EN/ES copy for /programs.
 *
 * COMPLIANCE — see lib/i18n/home.ts for the full rule. Short version:
 * regulatory and credential language is locked in English. In Spanish it is
 * rendered as a Spanish gloss followed by the approved English verbatim in
 * parentheses. Three strings on this page are verbatim-locked per the
 * 2026-05-29 Dr. Angely review and must not be reworded in EN:
 *   - the page subtitle ("Two professional development courses approved by…")
 *   - prerequisite #4 (English competency)
 *   - prerequisite #5 (online coursework with capstone)
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

export type BiCourse = { code: string; title: Bilingual; hours: number };

export type BiProgram = {
  id: string;
  title: Bilingual;
  tagline: Bilingual;
  length: Bilingual;
  format: Bilingual;
  credential: Bilingual;
  tuition: string;
  textbook: Bilingual;
  prerequisites: Bilingual[];
  summary: Bilingual;
  courses: BiCourse[];
};

export const programsCopy = {
  eyebrow: b("Diploma program & CE courses", "Programa de diploma y cursos de EC"),
  heading: b(
    "Florida-credentialed dental training, done right.",
    "Formación dental acreditada en Florida, bien hecha.",
  ),
  // LOCKED verbatim in English.
  subtitle: b(
    "Two professional development courses approved by the Florida Board of Dentistry — for working dental assistants advancing their credentials in Florida.",
    "Dos cursos de desarrollo profesional aprobados por la Junta de Odontología de Florida (two professional development courses approved by the Florida Board of Dentistry), para asistentes dentales en ejercicio que avanzan sus credenciales en Florida.",
  ),
  ctaAdmissions: b("Get started", "Comenzar"),
  ctaCompare: b("Compare programs", "Comparar programas"),

  /* --- Entry Level diploma feature (facts come from entryLevelDetail) --- */
  diploma: {
    eyebrow: b("Diploma Program", "Programa de Diploma"),
    title: b("Entry Level Dental Assisting", "Asistencia Dental de Nivel Inicial"),
    tagline: b(
      "6 months · In person · Jacksonville, FL",
      "6 meses · Presencial · Jacksonville, FL",
    ),
    price: "$9,850",
    priceBreakdown: b(
      "$9,700 tuition + $150 registration fee",
      "$9,700 de matrícula + $150 de cuota de inscripción",
    ),
    nextCohortLabel: b("Upcoming classes", "Próximas clases"),
    scheduleLabel: b("Class schedule", "Horario de clases"),
    apply: b("Apply now", "Inscribirse ahora"),
    details: b("Full program details", "Detalles completos del programa"),
    factsHeading: b("At a glance", "De un vistazo"),
  },

  /* Heading for the CE comparison table, now that the diploma sits above it. */
  compareHeading: b(
    "Professional development courses",
    "Cursos de desarrollo profesional",
  ),
  compareBody: b(
    "For working dental assistants advancing their credentials. Both courses are open enrollment — start anytime.",
    "Para asistentes dentales en ejercicio que avanzan sus credenciales. Ambos cursos son de inscripción abierta: comienza en cualquier momento.",
  ),

  table: {
    course: b("Course", "Curso"),
    length: b("Length", "Duración"),
    credential: b("Credential", "Credencial"),
    tuition: b("Tuition", "Matrícula"),
    note: b(
      "The Radiography and EFDA courses shown above are approved by the Florida Board of Dentistry.",
      "Los cursos de Radiografía y EFDA que se muestran arriba están aprobados por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry).",
    ),
  },

  detail: {
    courseLabel: b("Course", "Curso"),
    length: b("Length", "Duración"),
    format: b("Format", "Formato"),
    credential: b("Credential", "Credencial"),
    tuition: b("Tuition", "Matrícula"),
    textbook: b("Textbook", "Libro de texto"),
    apply: b("Apply to this course", "Inscribirse en este curso"),
    fullRequirements: b("Full requirements & cost", "Requisitos completos y costo"),
    beforeEnroll: b("Before you enroll", "Antes de inscribirte"),
    breakdown: b("Course breakdown", "Desglose del curso"),
    courseNum: b("Course #", "N.º de curso"),
    title: b("Title", "Título"),
    hours: b("Hours", "Horas"),
    total: b("Total", "Total"),
  },

  ce: {
    eyebrow: b("Continuing Education", "Educación Continua"),
    heading: b(
      "Professional development for working dental teams.",
      "Desarrollo profesional para equipos dentales en ejercicio.",
    ),
    body: b(
      "Short, focused CE courses for licensed dental assistants and hygienists — designed around Florida licensure requirements and the day-to-day skills working teams ask us for most.",
      "Cursos de educación continua breves y enfocados para asistentes dentales e higienistas con licencia, diseñados en torno a los requisitos de licencia de Florida y las habilidades diarias que los equipos nos piden con más frecuencia.",
    ),
    cards: [
      {
        title: b("Infection Control & OSHA", "Control de infecciones y OSHA"),
        body: b(
          "Annual refresh on current CDC and OSHA bloodborne-pathogen standards for dental settings.",
          "Actualización anual sobre las normas vigentes de los CDC y OSHA para patógenos transmitidos por la sangre en entornos dentales.",
        ),
      },
      {
        title: b("Radiation Health & Safety", "Salud y seguridad radiológica"),
        body: b(
          "Short refreshers for radiography-certified personnel between renewals.",
          "Repasos breves para el personal certificado en radiografía entre renovaciones.",
        ),
      },
      {
        title: b("HIPAA for Dental Teams", "HIPAA para equipos dentales"),
        body: b(
          "Practical patient-privacy compliance — what changed, what didn't, what auditors check for.",
          "Cumplimiento práctico de la privacidad del paciente: qué cambió, qué no, y qué revisan los auditores.",
        ),
      },
      {
        title: b("Medical Emergencies in the Office", "Emergencias médicas en el consultorio"),
        body: b(
          "Recognize and respond — syncope, anaphylaxis, cardiac events, airway compromise.",
          "Reconocer y responder: síncope, anafilaxia, eventos cardíacos y compromiso de la vía aérea.",
        ),
      },
      {
        title: b("Sterilization & Instrument Processing", "Esterilización y procesamiento de instrumentos"),
        body: b(
          "Hands-on review of CDC-aligned reprocessing workflows and biological monitoring.",
          "Repaso práctico de los flujos de reprocesamiento alineados con los CDC y del monitoreo biológico.",
        ),
      },
      {
        title: b("Custom team training", "Capacitación personalizada para tu equipo"),
        body: b(
          "Group sessions tailored to your practice — onboarding new assistants, refreshing veterans, prepping for state inspections.",
          "Sesiones grupales adaptadas a tu consultorio: incorporación de nuevos asistentes, actualización del personal con experiencia y preparación para inspecciones estatales.",
        ),
      },
    ],
    scheduleTitle: b("Want the CE schedule?", "¿Quieres el calendario de educación continua?"),
    scheduleBody: b(
      "Tell us which courses your team needs and we’ll send dates, pricing, and group rates.",
      "Dinos qué cursos necesita tu equipo y te enviaremos fechas, precios y tarifas grupales.",
    ),
    scheduleCta: b("Submit a Ticket", "Enviar un ticket"),
  },

  cta: {
    eyebrow: b(
      "Not sure which one is right for you?",
      "¿No sabes cuál es el adecuado para ti?",
    ),
    heading: b("We can help you decide.", "Podemos ayudarte a decidir."),
    body: b(
      "Tell us about your background, schedule, and what you care about — we’ll point you to the course that fits.",
      "Cuéntanos sobre tu experiencia, tu horario y lo que te importa, y te indicaremos el curso que mejor se adapte a ti.",
    ),
    button: b("Start the conversation", "Iniciar la conversación"),
  },
};

/* Course data — Radiography and EFDA are approved by the Florida Board of
   Dentistry. CIE applies only to FIDA's Entry Level Dental Assisting diploma
   program (handled separately). Content last verified 2026-05-29. */

export const programs: BiProgram[] = [
  {
    id: "radiography",
    title: b("Radiography for Dental Personnel", "Radiografía para Personal Dental"),
    tagline: b(
      "Florida-mandated dental radiography certification, delivered online.",
      "Certificación en radiografía dental exigida por Florida, impartida en línea.",
    ),
    length: b(
      "6 weeks · 14 clock hours (8 theory + 6 lab)",
      "6 semanas · 14 horas reloj (8 de teoría + 6 de laboratorio)",
    ),
    format: b(
      "Online — self-paced via FIDA Moodle",
      "En línea — a tu propio ritmo mediante FIDA Moodle",
    ),
    credential: b(
      "Professional Development Certificate · Florida Dental Radiography (FAC 64B5-9.011)",
      "Certificado de Desarrollo Profesional (Professional Development Certificate) · Radiografía Dental de Florida (FAC 64B5-9.011)",
    ),
    tuition: "$499.00",
    textbook: b(
      "Modern Dental Assisting, 14th Ed. — Robinson, Elsevier, 2024 (ISBN 978-0-323-82440-8)",
      "Modern Dental Assisting, 14.ª ed. — Robinson, Elsevier, 2024 (ISBN 978-0-323-82440-8)",
    ),
    prerequisites: [
      b("Be at least 18 years of age.", "Tener al menos 18 años de edad."),
      b(
        "A minimum of 3 months of continuous on-the-job training in the positioning and exposing of dental radiographs under a Florida-licensed dentist. Volunteer or shadowing does NOT count.",
        "Un mínimo de 3 meses de capacitación continua en el trabajo posicionando y tomando radiografías dentales bajo un dentista con licencia de Florida. El voluntariado o la observación NO cuentan.",
      ),
      b(
        "Signed acknowledgement from your supervising dentist confirming the three months of training.",
        "Constancia firmada por tu dentista supervisor que confirme los tres meses de capacitación.",
      ),
      // LOCKED verbatim in English.
      b(
        "Working competency in English — verified through completion of FIDA's online Continuing Education Assessment course alongside an in-office capstone performed under your supervising dentist.",
        "Competencia funcional en inglés (working competency in English), verificada mediante la finalización del curso en línea de Evaluación de Educación Continua de FIDA junto con una práctica final en el consultorio realizada bajo tu dentista supervisor.",
      ),
      // LOCKED verbatim in English.
      b(
        "Complete the online coursework with capstone project.",
        "Completar el curso en línea con el proyecto final (complete the online coursework with capstone project).",
      ),
    ],
    summary: b(
      "A focused review course for dental personnel covering radiation health & safety, intra-oral and extra-oral imaging techniques, and quality control — the criteria currently required by Florida law to operate dental X-ray equipment. Includes self-study readings and a clinical competency assessment submitted via the LMS.",
      "Un curso de repaso enfocado para personal dental que abarca salud y seguridad radiológica, técnicas de imagen intraoral y extraoral, y control de calidad: los criterios que la ley de Florida exige actualmente para operar equipos de rayos X dentales. Incluye lecturas de autoestudio y una evaluación de competencia clínica que se entrega mediante la plataforma.",
    ),
    courses: [
      { code: "RHS101", hours: 2, title: b("Foundations of Radiography, Radiographic Equipment, and Radiation Safety", "Fundamentos de la radiografía, equipo radiográfico y seguridad radiológica") },
      { code: "RHS102", hours: 3, title: b("Dental Imaging, Dental Film, and Processing Radiographs", "Imagenología dental, película dental y procesamiento de radiografías") },
      { code: "RHS103", hours: 3, title: b("Legal Issues, Quality Assurance, and Infection Prevention", "Aspectos legales, garantía de calidad y prevención de infecciones") },
      { code: "RHS104", hours: 4, title: b("Intraoral Imaging", "Imagenología intraoral") },
      { code: "RHS105", hours: 2, title: b("Extraoral Imaging", "Imagenología extraoral") },
    ],
  },
  {
    id: "efda",
    title: b(
      "Expanded Functions for the Dental Assistant",
      "Funciones Ampliadas para el Asistente Dental",
    ),
    tagline: b(
      "Earn the EFDA certificate Florida requires for expanded clinical procedures.",
      "Obtén el certificado EFDA que Florida exige para procedimientos clínicos ampliados.",
    ),
    length: b(
      "5 weeks · 20 clock hours (13 theory + 7 in-office hours)",
      "5 semanas · 20 horas reloj (13 de teoría + 7 horas en el consultorio)",
    ),
    format: b(
      "Hybrid — online theory + in office clinical lab",
      "Híbrido — teoría en línea + laboratorio clínico en el consultorio",
    ),
    credential: b(
      "Professional Development Certificate · Expanded Functions Dental Assistant",
      "Certificado de Desarrollo Profesional (Professional Development Certificate) · Asistente Dental de Funciones Ampliadas",
    ),
    tuition: "$1,049.00",
    textbook: b(
      "Modern Dental Assisting, 14th Ed. — Robinson, Elsevier, 2024 (ISBN 978-0-323-82440-8)",
      "Modern Dental Assisting, 14.ª ed. — Robinson, Elsevier, 2024 (ISBN 978-0-323-82440-8)",
    ),
    prerequisites: [
      b("Be at least 18 years of age.", "Tener al menos 18 años de edad."),
      b(
        "A minimum of 3 months of continuous on-the-job chairside training. Volunteer or shadowing does NOT count.",
        "Un mínimo de 3 meses de capacitación continua en el trabajo junto al sillón dental. El voluntariado o la observación NO cuentan.",
      ),
      b(
        "Signed acknowledgement from your supervising dentist confirming the three months of training.",
        "Constancia firmada por tu dentista supervisor que confirme los tres meses de capacitación.",
      ),
      // LOCKED verbatim in English.
      b(
        "Working competency in English — verified through completion of FIDA's online Continuing Education Assessment course alongside an in-office capstone performed under your supervising dentist.",
        "Competencia funcional en inglés (working competency in English), verificada mediante la finalización del curso en línea de Evaluación de Educación Continua de FIDA junto con una práctica final en el consultorio realizada bajo tu dentista supervisor.",
      ),
      // LOCKED verbatim in English.
      b(
        "Complete the online coursework with capstone project.",
        "Completar el curso en línea con el proyecto final (complete the online coursework with capstone project).",
      ),
    ],
    summary: b(
      "Theory and hands-on training in expanded-function procedures performed by dental assistants in a Florida dental practice. Built around the current Dental Assisting National Board curriculum so graduates can perform expanded clinical functions under dentist supervision, in compliance with the Florida Board of Dentistry.",
      "Teoría y práctica en procedimientos de funciones ampliadas que realizan los asistentes dentales en un consultorio de Florida. Está estructurado en torno al plan de estudios vigente del Dental Assisting National Board para que los egresados puedan realizar funciones clínicas ampliadas bajo la supervisión de un dentista, en cumplimiento con la Junta de Odontología de Florida (in compliance with the Florida Board of Dentistry).",
    ),
    courses: [
      { code: "EFDA101", hours: 1.5, title: b("Dental Sealants", "Selladores dentales") },
      { code: "EFDA102", hours: 1.5, title: b("Fluoride Placement", "Aplicación de flúor") },
      { code: "EFDA103", hours: 1.5, title: b("Polishing Clinical Crowns", "Pulido de coronas clínicas") },
      { code: "EFDA104", hours: 1.5, title: b("Liners, Bases, and Bonding Systems", "Forros, bases y sistemas adhesivos") },
      { code: "EFDA105", hours: 1.5, title: b("Temporary Restorations", "Restauraciones temporales") },
      { code: "EFDA106", hours: 1.5, title: b("Matrices", "Matrices") },
      { code: "EFDA107", hours: 1.5, title: b("Alginate Impressions and Study Models", "Impresiones de alginato y modelos de estudio") },
      { code: "EFDA108", hours: 1.5, title: b("Fabricating Temporary Crowns", "Fabricación de coronas temporales") },
      { code: "EFDA109", hours: 1.5, title: b("Placing Retraction Cord", "Colocación de hilo retractor") },
      { code: "EFDA110", hours: 1.5, title: b("Place / Remove Periodontal Dressing", "Colocar / retirar apósito periodontal") },
      { code: "EFDA111", hours: 1.5, title: b("Place / Remove Dental Dam", "Colocar / retirar dique de goma") },
      { code: "EFDA112", hours: 1.5, title: b("Suture Removal", "Retiro de suturas") },
      { code: "EFDA113", hours: 2, title: b("Infection Control", "Control de infecciones") },
    ],
  },
];
