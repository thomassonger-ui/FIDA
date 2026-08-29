import { COHORTS, COHORT_DATE_EN, COHORT_DATE_ES } from "@/lib/cohort";
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
  // Apply Now = /register — the enrollment hub (Atticus application → $150
  // registration fee via QuickBooks → confirmation). Per Tom/Ashley 2026-08-25.
  applyHref: "/register",
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
        "Diploma — Entry Level Dental Assisting, with Expanded Functions Dental Assistant and Dental Radiographer certifications",
        "Diploma — Asistencia Dental de Nivel Inicial (Entry Level Dental Assisting), con certificaciones de Expanded Functions Dental Assistant y Dental Radiographer",
      ),
    },
    {
      label: detailUi.factLabels.tuition,
      value: b(
        "$9,850 total — $9,700 tuition + $150 registration. $750 seat deposit; interest-free 6- or 8-month plans",
        "$9,850 en total — $9,700 de matrícula + $150 de inscripción. Depósito de cupo de $750; planes sin intereses de 6 u 8 meses",
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
      label: b("Upcoming classes", "Próximas clases"),
      value: b(
        COHORTS.map((c) => `${c.date.en} — ${c.schedule.en}`).join("\n"),
        COHORTS.map((c) => `${c.date.es} — ${c.schedule.es}`).join("\n"),
      ),
    },
  ],
  // Professionally produced program video, on FIDA's own YouTube channel
  // (@fldentalassisting). Supplied by Tom 2026-08-25.
  video: {
    youtubeId: "mPyxc7PWOvY",
    eyebrow: b("Inside the program", "Dentro del programa"),
    heading: b(
      "See the classroom, the lab, and the people who teach here.",
      "Conoce el aula, el laboratorio y a quienes enseñan aquí.",
    ),
    body: b(
      "A short look at how the Entry Level Dental Assisting program actually runs in Jacksonville — hands-on lab work, small classes, and instructors with 30+ years in dentistry.",
      "Un vistazo breve a cómo funciona realmente el programa de Asistencia Dental de Nivel Inicial en Jacksonville: práctica en laboratorio, grupos pequeños e instructoras con más de 30 años en odontología.",
    ),
    label: b(
      "FIDA Entry Level Dental Assisting Program",
      "Programa de Asistencia Dental de Nivel Inicial de FIDA",
    ),
  },
  testimonial: {
    quote: b(
      "I have had the pleasure of three assistants coming out of this program. And I can say I couldn't be happier with the amount of skills they have accumulated during the program but also in office.",
      "He tenido el gusto de recibir a tres asistentes egresadas de este programa. Y puedo decir que no podría estar más satisfecho con la cantidad de destrezas que acumularon durante el programa y también en el consultorio.",
    ),
    name: b("Dr. Hall, Amelia Perfect Smile", "Dr. Hall, Amelia Perfect Smile"),
    photo: {
      src: "/photos/dr-hall-amelia-perfect-smile-fida-graduates.jpg",
      width: 1200,
      height: 1371,
      alt: b(
        "Dr. Hall of Amelia Perfect Smile standing with two FIDA graduate dental assistants",
        "El Dr. Hall de Amelia Perfect Smile junto a dos asistentes dentales egresadas de FIDA",
      ),
      caption: b(
        "Dr. Hall of Amelia Perfect Smile, with FIDA graduates Allie Carter and Katy Fink.",
        "El Dr. Hall de Amelia Perfect Smile, con las egresadas de FIDA Allie Carter y Katy Fink.",
      ),
    },
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
    "Thirteen units take you from dental anatomy through chairside assisting, radiology, and front-office skills — a mix of classroom theory, hands-on lab work, and a real-office externship. You'll finish with Expanded Functions Dental Assistant and Dental Radiographer certifications, BLS/CPR/AED certification (through AHA), and graduate eligible for the Dental Assisting National Board (DANB) exam.",
    "Trece unidades te llevan desde la anatomía dental hasta la asistencia junto al sillón, la radiología y las destrezas administrativas — una combinación de teoría en el aula, práctica en laboratorio y una pasantía externa en un consultorio real. Terminarás con las certificaciones de Expanded Functions Dental Assistant y Dental Radiographer, la certificación BLS/CPR/AED (a través de la AHA), y egresarás elegible para el examen del Dental Assisting National Board (DANB).",
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
  photos: [
    {
      src: "/photos/dental-instrument-sterilization-autoclave-training.jpg",
      width: 1800,
      height: 1350,
      alt: b(
        "Dental assisting student loading an instrument cassette into the autoclave during sterilization training",
        "Estudiante de asistencia dental cargando un casete de instrumentos en el autoclave durante la práctica de esterilización",
      ),
      caption: b(
        "Sterilization & Infection Control (ELDA02) — OSHA-compliant instrument processing, practiced hands-on.",
        "Esterilización y control de infecciones (ELDA02): procesamiento de instrumentos conforme a OSHA, con práctica real.",
      ),
    },
    {
      src: "/photos/chairside-dental-assisting-clinical-training.jpg",
      width: 1350,
      height: 1800,
      alt: b(
        "Dental assisting student working chairside with a dentist during clinical training",
        "Estudiante de asistencia dental trabajando junto al sillón con un dentista durante la práctica clínica",
      ),
      caption: b(
        "Chairside clinical training — real four-handed dentistry in a working dental office.",
        "Práctica clínica junto al sillón: odontología a cuatro manos real en un consultorio dental activo.",
      ),
    },
  ],
  costEyebrow: detailUi.costEyebrow,
  costHeading: b(
    "How much does the diploma program cost?",
    "¿Cuánto cuesta el programa de diploma?",
  ),
  costBody: b(
    "Tuition is $9,700 plus a $150 registration fee — $9,850 total. That includes your two textbooks, a set of personalized scrubs, CPR/BLS/AED certification through the AHA, your student clinical kit, a personalized notebook binder, the resume workshop, membership to the American Dental Assistants Association, and all material and lab fees. You pay in three stages — the $150 registration fee online, a $750 seat deposit after admissions, and the balance on an interest-free 6- or 8-month in-house plan or an 18-month plan through TFC.",
    "La matrícula es de $9,700 más una cuota de inscripción de $150 — $9,850 en total. Incluye tus dos libros de texto, un juego de uniformes (scrubs) personalizados, la certificación CPR/BLS/AED a través de la AHA, tu kit clínico de estudiante, una carpeta personalizada, el taller de currículum, la membresía en la American Dental Assistants Association y todas las cuotas de materiales y laboratorio. Pagas en tres etapas: la cuota de inscripción de $150 en línea, un depósito de cupo de $750 después de la admisión, y el saldo en un plan interno sin intereses de 6 u 8 meses o en un plan de 18 meses a través de TFC.",
  ),
  // Renders <PaymentStructure/> under the cost grid (lib/payment.ts).
  showPaymentStructure: true,
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
        "You graduate with the FIDA Entry Level Dental Assisting diploma, Expanded Functions Dental Assistant and Dental Radiographer certifications, and BLS/CPR/AED certification through the AHA — eligible to sit for the Dental Assisting National Board (DANB) exam.",
        "Te gradúas con el diploma de Asistencia Dental de Nivel Inicial de FIDA, las certificaciones de Expanded Functions Dental Assistant y Dental Radiographer, y la certificación BLS/CPR/AED a través de la AHA — elegible para presentar el examen del Dental Assisting National Board (DANB).",
      ),
    },
    {
      q: b(
        "When do classes start, and what's the schedule?",
        "¿Cuándo comienzan las clases y cuál es el horario?",
      ),
      a: b(
        `Three upcoming classes in Jacksonville: ${COHORTS.map((c) => `${c.label.en} starting ${c.date.en} (${c.schedule.en})`).join("; ")}. Seats are limited and applications are reviewed as received — the next start is ${COHORT_DATE_EN}.`,
        `Tres próximas clases en Jacksonville: ${COHORTS.map((c) => `${c.label.es} a partir del ${c.date.es} (${c.schedule.es})`).join("; ")}. Los cupos son limitados y las solicitudes se revisan al recibirse — el próximo inicio es el ${COHORT_DATE_ES}.`,
      ),
    },
    {
      q: b(
        "How do I pay, and what's due when?",
        "¿Cómo pago y qué se debe en cada momento?",
      ),
      a: b(
        "Three stages. First, a $150 registration fee paid online when you register. Second, a $750 seat deposit after your admissions interview and tour — that's what holds your seat. Third, the $9,100 balance on an interest-free in-house plan ($1,516.66/month over 6 months or $1,137.50/month over 8 months) or an 18-month plan through TFC Tuition Financing. We accept card, ACH, check, and cash. Eligible military members and first responders receive a $1,500 tuition incentive — $8,350 total, $7,600 balance after the deposit, on the same plans ($1,266.67 over 6 months or $950 over 8 months); verified with a military ID or DD214.",
        "Tres etapas. Primero, una cuota de inscripción de $150 que se paga en línea al inscribirte. Segundo, un depósito de cupo de $750 después de tu entrevista de admisión y recorrido — eso es lo que reserva tu cupo. Tercero, el saldo de $9,100 en un plan interno sin intereses ($1,516.66 al mes por 6 meses o $1,137.50 al mes por 8 meses) o un plan de 18 meses a través de TFC Tuition Financing. Aceptamos tarjeta, ACH, cheque y efectivo. Los militares y primeros respondientes elegibles reciben un incentivo de matrícula de $1,500 — $8,350 en total, saldo de $7,600 después del depósito, en los mismos planes ($1,266.67 por 6 meses o $950 por 8 meses); se verifica con identificación militar o DD214.",
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
    "Apply through Atticus, our admissions intake — about five minutes — then pay the $150 registration fee online to secure your place. A FIDA advisor follows up within one business day.",
    "Postúlate con Atticus, nuestro sistema de admisiones — unos cinco minutos — y luego paga la cuota de inscripción de $150 en línea para asegurar tu lugar. Un asesor de FIDA te dará seguimiento en un día hábil.",
  ),
  ctaSeeAll: detailUi.ctaSeeAll,
};
