import type { Bilingual } from "./LanguageProvider";
import { COHORT_DATE } from "@/lib/cohort";

/**
 * EN/ES copy for /about and /tickets.
 *
 * COMPLIANCE — regulatory phrases carry the approved English verbatim in
 * parentheses on the Spanish side. See lib/i18n/home.ts for the full rule and
 * lib/i18n/programs.ts for the locked prerequisite strings.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

/* -------------------------------------------------------------- ABOUT --- */

export const about = {
  eyebrow: b("About FIDA", "Sobre FIDA"),
  heading: b(
    "A modern institute for a modern workforce.",
    "Un instituto moderno para una fuerza laboral moderna.",
  ),
  intro: b(
    "Florida Institute of Dental Assisting was built on a simple idea: the healthcare workforce needs more skilled people, and the path to getting there shouldn’t be two years, a dead-end degree, or a mountain of debt.",
    "El Florida Institute of Dental Assisting nació de una idea sencilla: el sector de la salud necesita más personal capacitado, y el camino para lograrlo no debería ser de dos años, un título sin salida ni una montaña de deudas.",
  ),

  valuesEyebrow: b("What we believe", "En qué creemos"),
  valuesHeading: b("Four things, done well.", "Cuatro cosas, bien hechas."),
  values: [
    {
      title: b("Hire-ready graduates.", "Egresados listos para trabajar."),
      body: b(
        "Each course maps to a Florida-recognized credential — issued by FIDA and aligned to Board of Dentistry approval criteria.",
        "Cada curso corresponde a una credencial reconocida en Florida, emitida por FIDA y alineada con los criterios de aprobación de la Junta de Odontología (Board of Dentistry approval criteria).",
      ),
    },
    {
      title: b("Small by design.", "Pequeños a propósito."),
      body: b(
        "1:12 instructor-to-student ratio. Real mentorship, real feedback, real accountability.",
        "Proporción instructor–estudiante de 1:12. Mentoría real, retroalimentación real, responsabilidad real.",
      ),
    },
    {
      title: b("Technology on your side.", "La tecnología de tu lado."),
      body: b(
        "Our systems answer routine questions around the clock so instructors can focus on teaching. Everyone wins.",
        "Nuestros sistemas responden las preguntas de rutina a toda hora para que los instructores puedan concentrarse en enseñar. Todos ganan.",
      ),
    },
    {
      title: b("Built for working adults.", "Diseñado para adultos que trabajan."),
      body: b(
        "In-person diploma program in Jacksonville. Online and hybrid continuing-education courses — finish the clinical capstone at your own dentist's office, signed off by your supervising dentist.",
        "Programa de diploma presencial en Jacksonville. Cursos de educación continua en línea e híbridos: completa la práctica clínica final en el consultorio de tu propio dentista, con la firma de tu dentista supervisor.",
      ),
    },
  ],

  locationEyebrowCampus: b("Campus", "Sede"),
  campusTitle: b("Jacksonville, Florida", "Jacksonville, Florida"),
  campusBody: b(
    "In-person Entry Level Dental Assisting diploma program in Jacksonville. Online and hybrid continuing-education courses (EFDA, Radiography) — the clinical capstone is completed at the student’s own dentist’s office and signed off by the supervising dentist.",
    "Programa de diploma presencial de Asistencia Dental de Nivel Inicial en Jacksonville. Cursos de educación continua en línea e híbridos (EFDA, Radiografía): la práctica clínica final se realiza en el consultorio del propio dentista del estudiante y la firma el dentista supervisor.",
  ),

  licensureEyebrow: b("Licensure", "Licencias y aprobaciones"),
  licensureTitle: b("State of Florida", "Estado de Florida"),
  licensureBody: b(
    "FIDA’s Entry Level Dental Assisting diploma program is licensed by the Florida Commission for Independent Education (institution #6501). The EFDA and Radiography courses are approved by the Florida Board of Dentistry.",
    "El programa de diploma de Asistencia Dental de Nivel Inicial de FIDA cuenta con licencia de la Comisión de Educación Independiente de Florida (licensed by the Florida Commission for Independent Education), institución n.º 6501. Los cursos de EFDA y Radiografía están aprobados por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry).",
  ),

  cohortEyebrow: b("Next cohort", "Próxima cohorte"),
  cohortDate: COHORT_DATE,
  cohortBody: b(
    "Fall 2026 intake. Seats are limited — applications reviewed as received.",
    "Ingreso de otoño 2026. Los cupos son limitados: las solicitudes se revisan al recibirse.",
  ),

  ctaHeading: b("See if FIDA is a fit.", "Descubre si FIDA es para ti."),
  ctaBody: b(
    "Send us a note and a FIDA advisor will follow up within one business day.",
    "Escríbenos y un asesor de FIDA te responderá en un día hábil.",
  ),
  ctaButton: b("Get in touch", "Contáctanos"),
};

/* ------------------------------------------------------------ TICKETS --- */

export const tickets = {
  eyebrow: b("Student Support", "Soporte al Estudiante"),
  headingLead: b("Open a ", "Abre un "),
  headingAccent: b("ticket.", "ticket."),
  intro: b(
    "Got a question about your program, professional development course, financial aid, scheduling, or tech access? Drop a note below and a FIDA staff member will reply within one business day.",
    "¿Tienes una pregunta sobre tu programa, tu curso de desarrollo profesional, ayuda financiera, horarios o acceso técnico? Escríbenos abajo y un miembro del personal de FIDA te responderá en un día hábil.",
  ),

  newTicketEyebrow: b("Open a new ticket", "Abrir un ticket nuevo"),
  newTicketHeading: b("Tell us what’s going on", "Cuéntanos qué sucede"),
  newTicketBody: b(
    "We’ll send a confirmation to your email and follow up there.",
    "Te enviaremos una confirmación por correo y daremos seguimiento allí.",
  ),

  howEyebrow: b("How this works", "Cómo funciona"),
  steps: [
    {
      n: "01",
      title: b("Submit a ticket", "Envía un ticket"),
      body: b(
        "Pick a category, tell us what’s up, attach a file if it helps.",
        "Elige una categoría, cuéntanos qué pasa y adjunta un archivo si ayuda.",
      ),
    },
    {
      n: "02",
      title: b("We get to work", "Nos ponemos a trabajar"),
      body: b(
        "Your ticket lands in our support queue right away.",
        "Tu ticket entra de inmediato en nuestra cola de soporte.",
      ),
    },
    {
      n: "03",
      title: b("Reply inside the portal", "Responde dentro del portal"),
      body: b(
        "A FIDA staff member replies inside your portal within one business day. Sign in to continue the conversation.",
        "Un miembro del personal de FIDA responde dentro de tu portal en un día hábil. Inicia sesión para continuar la conversación.",
      ),
    },
  ],
};

/* ------------------------------------------------------- TICKET FORM --- */

/**
 * COMPLIANCE — the program option labels below were corrected 2026-08-09:
 *   "Dental Assisting Foundation"                -> "Entry Level Dental Assisting"
 *   "Expanded Functions Dental Auxiliary (EFDA)" -> "Expanded Functions Dental Assistant (EFDA)"
 * Both old strings are on the banned list from the 2026-05-29 Dr. Angely
 * review. Do not reintroduce them. The `value` keys are unchanged so existing
 * ticket records keep resolving.
 */
export const ticketForm = {
  receivedEyebrow: b("Ticket received", "Ticket recibido"),
  receivedTitle: b("Thanks — we’ve got it.", "Gracias, ya lo recibimos."),
  receivedBody: b(
    "A FIDA staff member will follow up by email within one business day. Keep an eye on your inbox.",
    "Un miembro del personal de FIDA te responderá por correo en un día hábil. Revisa tu bandeja de entrada.",
  ),

  fullName: b("Full name", "Nombre completo"),
  email: b("Email", "Correo electrónico"),
  program: b("Program", "Programa"),
  category: b("Category", "Categoría"),
  subject: b("Subject", "Asunto"),
  message: b("Message", "Mensaje"),

  phName: b("Jane Doe", "Ana Pérez"),
  phEmail: b("jane@example.com", "ana@ejemplo.com"),
  phSubject: b(
    "Short summary of your question",
    "Resumen breve de tu pregunta",
  ),
  phMessage: b(
    "Walk us through what's going on. The more detail, the better.",
    "Cuéntanos qué sucede. Cuanto más detalle, mejor.",
  ),

  chooseOne: b("Choose one…", "Elige una…"),
  submit: b("Submit ticket", "Enviar ticket"),
  submitting: b("Submitting…", "Enviando…"),
  followUp: b(
    "We’ll follow up by email within one business day.",
    "Te responderemos por correo en un día hábil.",
  ),
  errGeneric: b(
    "Could not submit. Please try again.",
    "No se pudo enviar. Inténtalo de nuevo.",
  ),
  errNetwork: b(
    "Network error. Please try again.",
    "Error de red. Inténtalo de nuevo.",
  ),

  categories: [
    { value: "academics", label: b("Academics", "Académico") },
    { value: "financial_aid", label: b("Financial Aid", "Ayuda financiera") },
    { value: "scheduling", label: b("Scheduling", "Horarios") },
    { value: "transcripts", label: b("Transcripts", "Expedientes") },
    { value: "tech", label: b("Tech / Login", "Soporte técnico / Acceso") },
    { value: "other", label: b("Other", "Otro") },
  ],

  programs: [
    {
      value: "radiography",
      label: b("Radiography for Dental Personnel", "Radiografía para Personal Dental"),
    },
    {
      value: "efda",
      label: b(
        "Expanded Functions Dental Assistant (EFDA)",
        "Asistente Dental de Funciones Ampliadas (EFDA)",
      ),
    },
    {
      value: "foundation",
      label: b("Entry Level Dental Assisting", "Asistencia Dental de Nivel Inicial"),
    },
    {
      value: "professional_development",
      label: b("Professional Development course", "Curso de desarrollo profesional"),
    },
    { value: "", label: b("Not sure / not enrolled yet", "No estoy seguro / aún no me he inscrito") },
  ],
};
