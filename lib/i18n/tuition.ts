import { COHORT_DATE } from "@/lib/cohort";
import type { Bilingual } from "./LanguageProvider";

/**
 * EN/ES copy for /tuition.
 *
 * Pricing sourced from the legacy fldentalassisting.com /tuition page
 * (archived 2026-08-18). UPDATED 2026-08-25 per Ashley: the payment structure
 * (registration fee → seat deposit → balance, 6/8-month interest-free plans,
 * the military/first-responder $1,500 incentive, TFC 18-month option) lives
 * in lib/payment.ts and renders via <PaymentStructure/>. The EFDA/Radiography
 * CE courses are open enrollment with no fixed dates.
 *
 * COMPLIANCE — diploma is CIE-licensed; CE courses are Board-of-Dentistry
 * approved. Keep the distinction. No "financial aid available" claims —
 * the military incentive is an eligibility-based tuition rate, not aid.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

export const tuition = {
  eyebrow: b("Tuition", "Matrícula"),
  heading: b(
    "Straightforward pricing. No surprises.",
    "Precios claros. Sin sorpresas.",
  ),
  intro: b(
    "One flat price per program — books, scrubs, kits, and lab fees included where noted. No hidden fees, no surprise add-ons.",
    "Un precio fijo por programa — libros, uniformes, kits y cuotas de laboratorio incluidos donde se indica. Sin cargos ocultos ni extras sorpresa.",
  ),

  /* --- Entry Level diploma card --- */
  diploma: {
    eyebrow: b("Diploma Program", "Programa de Diploma"),
    title: b("Entry Level Dental Assisting", "Asistencia Dental de Nivel Inicial"),
    price: "$9,850",
    priceBreakdown: b(
      "$9,700 tuition + $150 registration fee",
      "$9,700 de matrícula + $150 de cuota de inscripción",
    ),
    length: b("6 months · Jacksonville, FL", "6 meses · Jacksonville, FL"),
    nextCohortLabel: b("Upcoming classes", "Próximas clases"),
    nextCohort: COHORT_DATE,
    includesHeading: b("Your tuition includes", "Tu matrícula incluye"),
    includes: [
      b("Textbooks (2)", "Libros de texto (2)"),
      b("One set of personalized scrubs", "Un juego de uniformes (scrubs) personalizados"),
      b("CPR/BLS/AED certification through AHA", "Certificación CPR/BLS/AED a través de la AHA"),
      b("Student clinical kit", "Kit clínico de estudiante"),
      b("Personalized notebook binder", "Carpeta personalizada"),
      b("Resume workshop", "Taller de currículum"),
      b(
        "Membership to the American Dental Assistants Association",
        "Membresía en la American Dental Assistants Association",
      ),
      b("All material and lab fees", "Todas las cuotas de materiales y laboratorio"),
    ],
    financing: b(
      "Pay in three stages: a $150 registration fee online, a $750 seat deposit after admissions, and the balance on an interest-free 6- or 8-month in-house plan — or 18 months through TFC. Full breakdown below.",
      "Paga en tres etapas: una cuota de inscripción de $150 en línea, un depósito de cupo de $750 después de la admisión, y el saldo en un plan interno sin intereses de 6 u 8 meses — o en 18 meses a través de TFC. Desglose completo abajo.",
    ),
    cta: b("Register & pay the $150 fee", "Inscríbete y paga la cuota de $150"),
    detailsLink: b("Full program details", "Detalles completos del programa"),
  },

  /* --- CE courses --- */
  ce: {
    eyebrow: b("Continuing Education", "Educación Continua"),
    heading: b(
      "Professional Development courses",
      "Cursos de Desarrollo Profesional",
    ),
    body: b(
      "For working dental assistants advancing their credentials. Both courses are open enrollment — start anytime — and approved by the Florida Board of Dentistry.",
      "Para asistentes dentales en ejercicio que avanzan sus credenciales. Ambos cursos tienen inscripción abierta — comienza cuando quieras — y están aprobados por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry).",
    ),
    openEnrollment: b("Open enrollment — start anytime", "Inscripción abierta — comienza cuando quieras"),
    cards: [
      {
        title: b(
          "Expanded Functions Dental Assistant (EFDA)",
          "Asistente Dental de Funciones Ampliadas (EFDA)",
        ),
        price: "$1,049",
        detail: b(
          "5 weeks · 20 clock hours · hybrid (online + in-office)",
          "5 semanas · 20 horas reloj · híbrido (en línea + en el consultorio)",
        ),
        href: "/programs/efda-certification-florida",
      },
      {
        title: b(
          "Radiography for Dental Personnel",
          "Radiografía para Personal Dental",
        ),
        price: "$499",
        detail: b(
          "6 weeks · 14 clock hours · fully online",
          "6 semanas · 14 horas reloj · totalmente en línea",
        ),
        href: "/programs/dental-radiography-certification",
      },
    ],
    courseDetails: b("Course details", "Detalles del curso"),
    enroll: b("Enroll now", "Inscríbete ahora"),
  },

  /* --- Real outcome (photo) --- */
  outcome: {
    eyebrow: b("Where graduates land", "Dónde llegan los egresados"),
    heading: b(
      "Three FIDA graduates now assist at one Jacksonville practice.",
      "Tres egresadas de FIDA hoy asisten en un mismo consultorio de Jacksonville.",
    ),
    body: b(
      "Dr. Hall of Amelia Perfect Smile has hired three assistants out of this program. Tuition buys the training — the job is what it's for.",
      "El Dr. Hall de Amelia Perfect Smile ha contratado a tres asistentes egresadas de este programa. La matrícula paga la formación; el empleo es el objetivo.",
    ),
    photoAlt: b(
      "Dr. Hall of Amelia Perfect Smile standing with two FIDA graduate dental assistants",
      "El Dr. Hall de Amelia Perfect Smile junto a dos asistentes dentales egresadas de FIDA",
    ),
    photoCaption: b(
      "Dr. Hall with FIDA graduates Allie Carter and Katy Fink.",
      "El Dr. Hall con las egresadas de FIDA Allie Carter y Katy Fink.",
    ),
  },

  /* --- Career outlook (cited) --- */
  outlook: {
    eyebrow: b("Career outlook", "Perspectiva laboral"),
    heading: b(
      "A career worth the investment.",
      "Una carrera que vale la inversión.",
    ),
    stats: [
      {
        stat: b("$23.11/hr", "$23.11/h"),
        label: b(
          "Median U.S. dental assistant wage — about $48,000/year",
          "Salario mediano de asistentes dentales en EE. UU. — unos $48,000 al año",
        ),
        source: b("U.S. BLS, OEWS May 2025", "U.S. BLS, OEWS mayo 2025"),
      },
      {
        stat: b("+14%", "+14 %"),
        label: b(
          "Projected growth in Florida dental assistant jobs, 2024–2034",
          "Crecimiento proyectado del empleo de asistentes dentales en Florida, 2024–2034",
        ),
        source: b(
          "Florida projections via Projections Central",
          "Proyecciones de Florida vía Projections Central",
        ),
      },
      {
        stat: b("~3,490", "~3,490"),
        label: b(
          "Dental assistant job openings per year in Florida",
          "Vacantes anuales de asistente dental en Florida",
        ),
        source: b(
          "Florida projections via Projections Central",
          "Proyecciones de Florida vía Projections Central",
        ),
      },
    ],
  },

  /* --- Closing CTA --- */
  cta: {
    heading: b("Questions about cost?", "¿Preguntas sobre el costo?"),
    body: b(
      "Talk to Atticus or book a call with Debbie or Ashley — real answers about tuition, financing, and which path fits your budget.",
      "Habla con Atticus o reserva una llamada con Debbie o Ashley: respuestas reales sobre matrícula, financiamiento y qué camino se ajusta a tu presupuesto.",
    ),
    primary: b("Talk to Atticus", "Habla con Atticus"),
    secondary: b("Schedule a tour", "Agenda una visita"),
  },
};
