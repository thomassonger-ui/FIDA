import { COHORT_DATE, COHORT_DATE_EN, COHORT_DATE_ES } from "@/lib/cohort";
import type { Bilingual } from "./LanguageProvider";
import { detailUi, type CourseDetail } from "./courseDetail";

/**
 * EN/ES copy for /programs/entry-level-dental-assisting — the flagship
 * Entry Level Dental Assisting DIPLOMA program detail page.
 *
 * Content sourced from the legacy fldentalassisting.com /our-program,
 * /tuition, and /apply-now pages (archived 2026-08-18) — this page is the
 * 301 target for /our-program after the domain merge.
 *
 * COMPLIANCE — this is the CIE-LICENSED diploma program, NOT a Board-of-
 * Dentistry-approved PD course. The eyebrow, credential fact, and FAQ answers
 * below keep that distinction exactly as approved in the 2026-05-29 review.
 * Career-outlook figures are cited (BLS OEWS May 2025; Florida 2024–34
 * projections) — do not swap in uncited marketing numbers.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

export const entryLevelDetail: CourseDetail = {
  slug: "entry-level-dental-assisting",
  pageUrl:
    "https://fldentalassisting.com/programs/entry-level-dental-assisting",
  // Apply Now = the Atticus intake, not Moodle.
  applyHref: "/atticus",
  eyebrow: b(
    "Diploma Program · Jacksonville, Florida",
    "Programa de Diploma · Jacksonville, Florida",
  ),
  h1: b(
    "Entry Level Dental Assisting — Diploma Program",
    "Asistencia Dental de Nivel Inicial: Programa de Diploma",
  ),
  intro: b(
    "FIDA's six-month Entry Level Dental Assisting diploma program takes you from no dental experience to clinic-ready: 142 hours of theory, 76 hands-on lab hours, and a 160-hour externship in a real dental office under a licensed dentist. Licensed by the Florida Commission for Independent Education (institution #6501) and taught in person in Jacksonville by instructors with 30+ years in dentistry.",
    "El programa de diploma de Asistencia Dental de Nivel Inicial de FIDA, de seis meses, te lleva de cero experiencia dental a estar listo para la clínica: 142 horas de teoría, 76 horas de laboratorio práctico y una pasantía externa de 160 horas en un consultorio dental real bajo un dentista con licencia. Cuenta con licencia de la Comisión de Educación Independiente de Florida (licensed by the Florida Commission for Independent Education), institución n.º 6501, y se imparte en persona en Jacksonville por instructoras con más de 30 años en odontología.",
  ),
  applyNow: b("Apply now", "Inscribirse ahora"),
  getStarted: b("Ask a question", "Haz una pregunta"),
  facts: [
    {
      label: detailUi.factLabels.length,
      value: b(
        "6 months · 378 clock hours (142 theory + 76 lab + 160 externship)",
        "6 meses · 378 horas reloj (142 de teoría + 76 de laboratorio + 160 de pasantía externa)",
      ),
    },
    {
      label: detailUi.factLabels.format,
      value: b(
        "In person in Jacksonville, FL — plus an externship in a working dental office",
        "Presencial en Jacksonville, FL, más una pasantía externa en un consultorio dental activo",
      ),
    },
    {
      label: detailUi.factLabels.credential,
      value: b(
        "Diploma — Entry Level Dental Assisting",
        "Diploma — Asistencia Dental de Nivel Inicial (Entry Level Dental Assisting)",
      ),
    },
    {
      label: detailUi.factLabels.tuition,
      value: b(
        "$9,850 total — $9,700 tuition + $150 registration",
        "$9,850 en total — $9,700 de matrícula + $150 de inscripción",
      ),
    },
    {
      label: detailUi.factLabels.approval,
      value: b(
        "Licensed by the Florida Commission for Independent Education (#6501)",
        "Con licencia de la Comisión de Educación Independiente de Florida (licensed by the Florida Commission for Independent Education), n.º 6501",
      ),
    },
    {
      label: b("Next cohort", "Próxima cohorte"),
      value: COHORT_DATE,
    },
  ],
  testimonial: {
    quote: b(
      "I have had the pleasure of three assistants coming out of this program. And I can say I couldn't be happier with the amount of skills they have accumulated during the program but also in office.",
      "He tenido el gusto de recibir a tres asistentes egresadas de este programa. Y puedo decir que no podría estar más satisfecho con la cantidad de destrezas que acumularon durante el programa y también en el consultorio.",
    ),
    name: b("Dr. Hall, Amelia Perfect Smile", "Dr. Hall, Amelia Perfect Smile"),
  },
  requirementsEyebrow: detailUi.requirementsEyebrow,
  requirementsHeading: b(
    "Admission requirements",
    "Requisitos de admisión",
  ),
  requirements: [
    b("Be 18 years of age or older.", "Tener 18 años de edad o más."),
    b(
      "Hold a high school diploma or GED.",
      "Contar con un diploma de escuela secundaria o GED.",
    ),
    b(
      "Complete a personal interview and a tour of our Jacksonville facility.",
      "Completar una entrevista personal y un recorrido por nuestras instalaciones en Jacksonville.",
    ),
    b(
      "Pass a criminal background screening. Applicants with felony convictions are not eligible for admission.",
      "Aprobar una verificación de antecedentes penales. Las personas con condenas por delitos graves (felony convictions) no son elegibles para la admisión.",
    ),
    b(
      "Show proof of Hepatitis B vaccination, or declare the intent to receive it.",
      "Presentar comprobante de vacunación contra la Hepatitis B, o declarar la intención de recibirla.",
    ),
    b(
      "Show proof of a current Tetanus vaccination.",
      "Presentar comprobante de vacunación vigente contra el Tétanos.",
    ),
    b(
      "Sign the program registration forms.",
      "Firmar los formularios de inscripción del programa.",
    ),
  ],
  curriculumEyebrow: detailUi.curriculumEyebrow,
  curriculumHeading: detailUi.curriculumHeading,
  curriculumBody: b(
    "Thirteen units take you from dental anatomy through chairside assisting, radiology, and front-office skills — a mix of classroom theory, hands-on lab work, and a real-office externship. You'll finish with BLS/CPR/AED certification (through AHA), be prepared to sit for the Florida Dental Radiography certificate, and graduate eligible for the Dental Assisting National Board (DANB) exam.",
    "Trece unidades te llevan desde la anatomía dental hasta la asistencia junto al sillón, la radiología y las destrezas administrativas — una combinación de teoría en el aula, práctica en laboratorio y una pasantía externa en un consultorio real. Terminarás con la certificación BLS/CPR/AED (a través de la AHA), preparado para presentar el certificado de Radiografía Dental de Florida, y egresarás elegible para el examen del Dental Assisting National Board (DANB).",
  ),
  courses: [
    { code: "ELDA01", title: b("Introduction to Dentistry", "Introducción a la odontología") },
    { code: "ELDA02", title: b("Sterilization & Infection Control (OSHA compliant)", "Esterilización y control de infecciones (conforme a OSHA)") },
    { code: "ELDA03", title: b("Foundation of Clinical Dentistry", "Fundamentos de odontología clínica") },
    { code: "ELDA04", title: b("Anesthesia & Pain Control", "Anestesia y control del dolor") },
    { code: "ELDA05", title: b("Assisting in Comprehensive Dental Care", "Asistencia en atención dental integral") },
    { code: "ELDA06", title: b("Dental Administration & Communication Skills", "Administración dental y habilidades de comunicación") },
    { code: "ELDA07", title: b("BLS/CPR/AED Certification", "Certificación BLS/CPR/AED") },
    { code: "ELDA08", title: b("Anatomy & Physiology", "Anatomía y fisiología") },
    { code: "ELDA09", title: b("Radiation Physics & Imaging Techniques", "Física de la radiación y técnicas de imagenología") },
    { code: "ELDA10", title: b("Dental Materials", "Materiales dentales") },
    { code: "ELDA11", title: b("Digital Scanning Technology", "Tecnología de escaneo digital") },
    { code: "ELDA12", title: b("Laboratory Procedures", "Procedimientos de laboratorio") },
    { code: "ELDA13", title: b("Resume Workshop & Interview Coaching", "Taller de currículum y preparación para entrevistas") },
  ],
  costEyebrow: detailUi.costEyebrow,
  costHeading: b(
    "How much does the diploma program cost?",
    "¿Cuánto cuesta el programa de diploma?",
  ),
  costBody: b(
    "Tuition is $9,700 plus a $150 non-refundable registration fee — $9,850 total. That includes your two textbooks, a set of personalized scrubs, CPR/BLS/AED certification through the AHA, your student clinical kit, a personalized notebook binder, the resume workshop, membership to the American Dental Assistants Association, and all material and lab fees. Financing options are available — ask an advisor.",
    "La matrícula es de $9,700 más una cuota de inscripción no reembolsable de $150 — $9,850 en total. Incluye tus dos libros de texto, un juego de uniformes (scrubs) personalizados, la certificación CPR/BLS/AED a través de la AHA, tu kit clínico de estudiante, una carpeta personalizada, el taller de currículum, la membresía en la American Dental Assistants Association y todas las cuotas de materiales y laboratorio. Hay opciones de financiamiento disponibles: pregunta a un asesor.",
  ),
  priceDisplay: "$9,850",
  priceNote: b(
    "Total · $9,700 tuition + $150 registration · 6 months",
    "Total · $9,700 de matrícula + $150 de inscripción · 6 meses",
  ),
  faqEyebrow: detailUi.faqEyebrow,
  faqHeading: b(
    "Entry Level Dental Assisting FAQ",
    "Preguntas frecuentes sobre Asistencia Dental de Nivel Inicial",
  ),
  faqs: [
    {
      q: b(
        "How long does it take to become a dental assistant at FIDA?",
        "¿Cuánto tiempo toma convertirse en asistente dental en FIDA?",
      ),
      a: b(
        "Six months. The program totals 378 clock hours: 142 hours of classroom theory, 76 hands-on lab hours, and a 160-hour externship in a working dental office under a licensed dentist's supervision.",
        "Seis meses. El programa suma 378 horas reloj: 142 horas de teoría en el aula, 76 horas de laboratorio práctico y una pasantía externa de 160 horas en un consultorio dental activo bajo la supervisión de un dentista con licencia.",
      ),
    },
    {
      q: b(
        "What certifications do I graduate with?",
        "¿Con qué certificaciones me gradúo?",
      ),
      a: b(
        "You earn the FIDA Entry Level Dental Assisting diploma and BLS/CPR/AED certification through the AHA, you're prepared to sit for the Florida Dental Radiography certificate, and you graduate eligible for the Dental Assisting National Board (DANB) exam.",
        "Obtienes el diploma de Asistencia Dental de Nivel Inicial de FIDA y la certificación BLS/CPR/AED a través de la AHA, sales preparado para presentar el certificado de Radiografía Dental de Florida, y egresas elegible para el examen del Dental Assisting National Board (DANB).",
      ),
    },
    {
      q: b(
        "When does the next cohort start?",
        "¿Cuándo comienza la próxima cohorte?",
      ),
      a: b(
        `The next cohort begins ${COHORT_DATE_EN} in Jacksonville. Seats are limited and applications are reviewed as received — start yours through Atticus, our admissions intake.`,
        `La próxima cohorte comienza el ${COHORT_DATE_ES} en Jacksonville. Los cupos son limitados y las solicitudes se revisan al recibirse: inicia la tuya con Atticus, nuestro sistema de admisiones.`,
      ),
    },
    {
      q: b(
        "Is FIDA a licensed school?",
        "¿FIDA es una escuela con licencia?",
      ),
      a: b(
        "Yes. The Entry Level Dental Assisting diploma program is licensed by the Florida Commission for Independent Education (institution #6501). FIDA's EFDA and Radiography courses are separately approved by the Florida Board of Dentistry.",
        "Sí. El programa de diploma de Asistencia Dental de Nivel Inicial cuenta con licencia de la Comisión de Educación Independiente de Florida (licensed by the Florida Commission for Independent Education), institución n.º 6501. Los cursos de EFDA y Radiografía de FIDA están aprobados por separado por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry).",
      ),
    },
    {
      q: b(
        "What do dental assistants earn, and is the field growing?",
        "¿Cuánto ganan los asistentes dentales y está creciendo el campo?",
      ),
      a: b(
        "Nationally, dental assistants earned a median $23.11/hour — about $48,000/year — as of May 2025 (U.S. Bureau of Labor Statistics, OEWS). In Florida, dental assistant employment is projected to grow 14% from 2024 to 2034, with roughly 3,490 openings per year (state labor projections via Projections Central).",
        "A nivel nacional, los asistentes dentales ganaron una mediana de $23.11 por hora — alrededor de $48,000 al año — a mayo de 2025 (U.S. Bureau of Labor Statistics, OEWS). En Florida, se proyecta que el empleo de asistentes dentales crezca 14% entre 2024 y 2034, con aproximadamente 3,490 vacantes por año (proyecciones laborales estatales vía Projections Central).",
      ),
    },
    {
      q: b(
        "Do I need any dental experience to apply?",
        "¿Necesito experiencia dental para postularme?",
      ),
      a: b(
        "No. This program is built for people entering the field. You need to be 18+, hold a high school diploma or GED, complete an interview and campus tour, pass a background screening, and show proof of Hepatitis B (or intent to receive) and current Tetanus vaccinations.",
        "No. Este programa está diseñado para quienes ingresan al campo. Necesitas tener 18 años o más, un diploma de secundaria o GED, completar una entrevista y un recorrido por el campus, aprobar una verificación de antecedentes y presentar comprobante de vacunación contra la Hepatitis B (o intención de recibirla) y contra el Tétanos vigente.",
      ),
    },
  ],
  ctaHeading: b(
    "Ready to start your dental assisting career?",
    "¿Listo para comenzar tu carrera en asistencia dental?",
  ),
  ctaBody: b(
    "Apply through Atticus, our admissions intake — takes about five minutes, and a FIDA advisor follows up within one business day.",
    "Postúlate con Atticus, nuestro sistema de admisiones: toma unos cinco minutos, y un asesor de FIDA te dará seguimiento en un día hábil.",
  ),
  ctaSeeAll: detailUi.ctaSeeAll,
};
