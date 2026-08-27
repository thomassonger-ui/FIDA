import type { Bilingual } from "./LanguageProvider";
import { COHORT_DATE } from "@/lib/cohort";

/**
 * EN/ES copy for the landing chrome (Nav + Footer) and the homepage.
 *
 * COMPLIANCE NOTE — do not "clean up" the Spanish strings below.
 * Per the 2026-05-29 Dr. Angely review, the regulatory phrases are locked in
 * English. Where they appear in Spanish they are rendered as a Spanish gloss
 * followed by the English original verbatim in parentheses, so the controlling
 * language always appears on the page exactly as approved:
 *
 *   - "licensed by the Commission for Independent Education"  (ELDA diploma)
 *   - "approved by the Florida Board of Dentistry"            (EFDA + Radiography)
 *
 * Never swap "licensed" / "approved" between the two, in either language.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

/* ---------------------------------------------------------------- NAV --- */

export const nav = {
  links: [
    { href: "/programs", label: b("Programs & Courses", "Programas y Cursos") },
    { href: "/tuition", label: b("Tuition", "Matrícula") },
    { href: "/about", label: b("About", "Nosotros") },
    { href: "/contact", label: b("Contact", "Contacto") },
  ],
  // Primary intake CTA — sits in the nav so every page has a one-click path
  // into registration.
  atticusCta: b("Talk to Atticus", "Habla con Atticus"),
  studentSignIn: b("Student sign in", "Acceso estudiantes"),
  skipToContent: b("Skip to main content", "Saltar al contenido principal"),
  openMenu: b("Open menu", "Abrir menú"),
  closeMenu: b("Close menu", "Cerrar menú"),
  /** Button label always names the language you'd switch TO. */
  switchTo: b("Español", "English"),
  switchAria: b("Ver este sitio en español", "View this site in English"),
};

/* -------------------------------------------------------- CREDENTIALS --- */
/* Institutional standing, stated plainly. Three surfaces share this copy:
   the announcement bar above the nav, the strip beneath the homepage hero,
   and the footer verification line. "Licensed" = CIE (the diploma program);
   "approved" = Board of Dentistry (the CE courses). Never say "accredited". */

export const credentials = {
  barLicensed: b("Florida-Licensed Institution", "Institución con licencia de Florida"),
  barApproved: b(
    "Florida Board of Dentistry–Approved Program",
    "Programa aprobado por la Junta de Odontología de Florida",
  ),
  items: [
    {
      label: b("State Licensed", "Licencia estatal"),
      body: b("Commission for Independent Education", "Commission for Independent Education"),
    },
    {
      label: b("Education Oversight", "Supervisión educativa"),
      body: b("Florida Department of Education", "Departamento de Educación de Florida"),
    },
    {
      label: b("Program Approved", "Programa aprobado"),
      body: b("Florida Board of Dentistry", "Junta de Odontología de Florida"),
    },
  ],
  licenseNo: "6501",
  footerStatement: b(
    "Licensed by the Commission for Independent Education, Florida Department of Education. License No. 6501. Program approved by the Florida Board of Dentistry.",
    "Con licencia de la Commission for Independent Education, Departamento de Educación de Florida. Licencia n.º 6501. Programa aprobado por la Junta de Odontología de Florida (Florida Board of Dentistry).",
  ),
};

/* ------------------------------------------------------------- FOOTER --- */

export const footer = {
  hours: b(
    "Open Monday–Friday, 9 a.m.–3 p.m.",
    "Abierto de lunes a viernes, 9 a.m. a 3 p.m.",
  ),
  navigate: b("Navigate", "Navegación"),
  support: b("Support", "Soporte"),
  programs: b("Programs & Courses", "Programas y Cursos"),
  tuition: b("Tuition", "Matrícula"),
  contact: b("Contact", "Contacto"),
  tour: b("Schedule a tour", "Agenda una visita"),
  about: b("About", "Nosotros"),
  submitTicket: b("Submit a Ticket", "Enviar un ticket"),
  policiesHeading: b("Policies", "Políticas"),
  privacy: b("Privacy Policy", "Política de Privacidad"),
  terms: b("Terms of Use", "Términos de Uso"),
  accessibility: b("Accessibility", "Accesibilidad"),
  nonDiscrimination: b("Non-Discrimination", "No Discriminación"),
  refunds: b("Cancellation & Refunds", "Cancelación y Reembolsos"),
  atticus: b("Talk to Atticus", "Habla con Atticus"),
  admissionsHeading: b("Admissions", "Admisiones"),
  startRegistration: b("Start your registration", "Comienza tu registro"),
  bookCall: b("Book a 15-min call", "Reservar una llamada de 15 min"),
  adminDashboard: b("Admin Dashboard", "Panel administrativo"),
  rights: b(
    "Florida Institute of Dental Assisting. All rights reserved.",
    "Florida Institute of Dental Assisting. Todos los derechos reservados.",
  ),
};

/* --------------------------------------------------------------- HOME --- */

export const home = {
  hero: {
    badge: b("Now enrolling — Fall 2026", "Inscripciones abiertas — Otoño 2026"),
    // The H1 is split so the teal accent span lands in the right place in
    // both languages. This pair is what rotates on the homepage.
    titleLead: b("Your career in ", "Tu carrera en la "),
    titleAccent: b(
      "dentistry — and the courses that grow it.",
      "odontología — y los cursos que la hacen crecer.",
    ),
    subhead: b(
      "Florida Institute of Dental Assisting trains the next generation of dental assistants — radiography-certified, EFDA-credentialed, and clinic-ready. One licensed diploma program for new dental assistants. Two Board-approved CE courses for working ones. Find your next step.",
      "El Florida Institute of Dental Assisting forma a la próxima generación de asistentes dentales: certificados en radiografía, acreditados como EFDA y listos para la clínica. Un programa de diploma con licencia para nuevos asistentes dentales. Dos cursos de educación continua aprobados por la Junta para quienes ya trabajan. Decide tu próximo paso.",
    ),
    ctaPrimary: b("See the diploma program & CE courses", "Ver el programa de diploma y los cursos de EC"),
    ctaSecondary: b("I’m already a student", "Ya soy estudiante"),
    // LOCKED — English strings are Dr. Angely's exact wording.
    trust1: b(
      "Dental Assisting Program licensed by the Commission for Independent Education.",
      "Programa de Asistencia Dental con licencia de la Comisión de Educación Independiente (licensed by the Commission for Independent Education).",
    ),
    trust2: b(
      "EFDA and Radiography courses approved by the Florida Board of Dentistry.",
      "Cursos de EFDA y Radiografía aprobados por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry).",
    ),
  },

  pillars: [
    {
      // Replaced the unsourced "94% graduate placement rate" (2026-08-25).
      // It was a claim about FIDA's OWN graduates with no methodology, and it
      // contradicted /terms, which states outcome figures come from published
      // government labor statistics and are cited where they appear. This
      // figure is cited and matches the ELDA program page FAQ.
      stat: b("14%", "14 %"),
      label: b(
        "Projected job growth in Florida",
        "Crecimiento laboral proyectado en Florida",
      ),
      note: b(
        "Dental assistants, 2024–2034 (Projections Central)",
        "Asistentes dentales, 2024–2034 (Projections Central)",
      ),
    },
    {
      stat: b("8", "8"),
      label: b("Students in the average class", "Estudiantes por clase en promedio"),
      note: b(
        "Capped at 12 — real mentorship, not lecture halls",
        "Máximo de 12 — mentoría real, no aulas masivas",
      ),
    },
    {
      stat: b("Hybrid", "Híbrido"),
      label: b("Study on your schedule", "Estudia según tu horario"),
      note: b(
        "Online coursework with an in-office clinical capstone at your own practice",
        "Cursos en línea con una práctica clínica final en tu propio consultorio",
      ),
    },
  ],

  audience: {
    card1: {
      eyebrow: b("Not yet a dental assistant", "Aún no eres asistente dental"),
      title: b("Entry Level Dental Assisting", "Asistencia Dental de Nivel Inicial"),
      body: b(
        "Florida’s licensed diploma program for new dental assistants — operated in Jacksonville, FL. Licensed by the Commission for Independent Education.",
        "El programa de diploma con licencia de Florida para nuevos asistentes dentales, impartido en Jacksonville, FL. Con licencia de la Comisión de Educación Independiente (licensed by the Commission for Independent Education).",
      ),
      cta: b("Explore the diploma program", "Conocer el programa de diploma"),
    },
    card2: {
      eyebrow: b(
        "Already a working dental assistant",
        "Ya trabajas como asistente dental",
      ),
      title: b("Professional Development Courses", "Cursos de Desarrollo Profesional"),
      body: b(
        "EFDA and Radiography continuing-education courses approved by the Florida Board of Dentistry — for working dental assistants advancing their credentials.",
        "Cursos de educación continua de EFDA y Radiografía aprobados por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry), para asistentes dentales en ejercicio que avanzan sus credenciales.",
      ),
      cta: b("Browse PD courses", "Ver cursos de desarrollo profesional"),
    },
    card3: {
      eyebrow: b("Already a student", "Ya eres estudiante"),
      title: b("Student portal", "Portal del estudiante"),
      body: b(
        "Tickets, messages with staff, documents, and your course progress.",
        "Tickets, mensajes con el personal, documentos y tu progreso en los cursos.",
      ),
      cta: b("Sign in", "Iniciar sesión"),
    },
  },

  programsSection: {
    eyebrow: b("What we offer", "Lo que ofrecemos"),
    headingLead: b("Two paths. One destination: ", "Dos caminos. Un mismo destino: "),
    headingAccent: b("a real career.", "una carrera de verdad."),
    seeAll: b("Diploma program · CE courses", "Programa de diploma · Cursos de EC"),
    details: b("Program details", "Detalles del programa"),
    courseDetails: b("Course details", "Detalles del curso"),
    cards: [
      {
        href: "/programs/entry-level-dental-assisting",
        title: b("Entry Level Dental Assisting", "Asistencia Dental de Nivel Inicial"),
        length: b("Diploma program", "Programa de diploma"),
        outcome: b(
          "Licensed by the Commission for Independent Education",
          "Con licencia de la Commission for Independent Education",
        ),
        blurb: b(
          "Florida’s licensed entry path for new dental assistants. The Entry Level Dental Assisting diploma program is operated in Jacksonville, FL.",
          "La vía de entrada con licencia de Florida para nuevos asistentes dentales. El programa de diploma de Asistencia Dental de Nivel Inicial se imparte en Jacksonville, FL.",
        ),
      },
      {
        href: "/programs#professional-development",
        title: b("EFDA & Radiography CE Courses", "Cursos de EC de EFDA y Radiografía"),
        length: b("Professional development · Certificate on completion", "Desarrollo profesional · Certificado al completar"),
        isCourse: true,
        outcome: b(
          "Approved by the Florida Board of Dentistry",
          "Aprobados por la Florida Board of Dentistry",
        ),
        blurb: b(
          "Continuing-education courses for working dental assistants advancing their credentials. Study online; finish the clinical capstone at your own dentist’s office.",
          "Cursos de educación continua para asistentes dentales en ejercicio que avanzan sus credenciales. Estudia en línea y completa la práctica clínica final en el consultorio de tu propio dentista.",
        ),
      },
    ],
  },

  /* Homepage testimonial — Dr. Joseph Angley, added per Tom 2026-08-18.
   * Wording pre-cleared for compliance: "courses" (not "programs"),
   * "Radiography" (not "Radiology"). */
  testimonial: {
    // NOTE: Dr. Angley is not a dentist — keep this label profession-neutral.
    eyebrow: b("Testimonial", "Testimonio"),
    quote: b(
      "FIDA's online EFDA and Radiography CE courses are the most innovative I've seen in Florida. Debbie and Ashley Sanders are friendly, knowledgeable instructors who genuinely invest in every student.",
      "Los cursos de educación continua en línea de EFDA y Radiografía de FIDA son los más innovadores que he visto en Florida. Debbie y Ashley Sanders son instructoras amables y conocedoras que se dedican de verdad a cada estudiante.",
    ),
    name: "Dr. Joseph Angley",
    org: "Cole Middleton Group",
    orgUrl: "https://www.colemiddleton.com/",
  },

  why: {
    eyebrow: b("Why FIDA", "Por qué FIDA"),
    heading: b(
      "Smaller class. Smarter system. Real career.",
      "Grupos pequeños. Sistema inteligente. Carrera real.",
    ),
    items: [
      {
        title: b("Support when you need it.", "Apoyo cuando lo necesitas."),
        body: b(
          "Our team answers your questions and helps keep your enrollment on track — submit a ticket anytime and a FIDA advisor follows up.",
          "Nuestro equipo responde tus preguntas y mantiene tu inscripción en marcha: envía un ticket cuando quieras y un asesor de FIDA te dará seguimiento.",
        ),
      },
      {
        title: b("Built for working adults.", "Diseñado para adultos que trabajan."),
        body: b(
          "The Entry Level Dental Assisting diploma program is operated in Jacksonville, Florida. EFDA and Radiography CE courses are hybrid — study online, finish the clinical capstone at your own dentist’s office — under your supervising dentist’s sign-off. Keep your job while you advance your credentials.",
          "El programa de diploma de Asistencia Dental de Nivel Inicial se imparte en Jacksonville, Florida. Los cursos de educación continua de EFDA y Radiografía son híbridos: estudias en línea y completas la práctica clínica final en el consultorio de tu propio dentista, con la firma de tu dentista supervisor. Conserva tu empleo mientras avanzas tus credenciales.",
        ),
      },
      {
        title: b(
          "Credentials that employers trust.",
          "Credenciales en las que los empleadores confían.",
        ),
        body: b(
          "FIDA’s Entry Level Dental Assisting diploma program is licensed by the Florida Commission for Independent Education. The EFDA and Radiography courses are approved by the Florida Board of Dentistry.",
          "El programa de diploma de Asistencia Dental de Nivel Inicial de FIDA cuenta con licencia de la Comisión de Educación Independiente de Florida (licensed by the Florida Commission for Independent Education). Los cursos de EFDA y Radiografía están aprobados por la Junta de Odontología de Florida (approved by the Florida Board of Dentistry).",
        ),
      },
    ],
  },

  cohort: {
    eyebrow: b("Next cohort", "Próxima cohorte"),
    date: COHORT_DATE,
    note: b(
      "Jacksonville-based. EFDA and Radiography CE courses are open enrollment — start anytime. Diploma seats fill 6–8 weeks before start date.",
      "Con sede en Jacksonville. Los cursos de educación continua de EFDA y Radiografía tienen inscripción abierta: comienza cuando quieras. Los cupos del diploma se llenan de 6 a 8 semanas antes de la fecha de inicio.",
    ),
    // "Priority deadline: August 17" went stale the day it passed — replaced
    // with an evergreen status. (Same card slot, same component.)
    priorityLabel: b("Applications", "Solicitudes"),
    priorityValue: b("Reviewed as received", "Se revisan al recibirse"),
    seatsLabel: b("Enrollment status", "Estado de inscripción"),
    // Was a hard-coded "24 / 60". Unverifiable seat counts are a marketing
    // claim; replaced with a status that is true without a live seat feed.
    seatsValue: b("Open", "Abierta"),
  },

  student: {
    eyebrow: b("Already a student?", "¿Ya eres estudiante?"),
    heading: b("Pick up where you left off.", "Retoma donde lo dejaste."),
    body: b(
      "Your portal has your tickets, messages from staff, and your document vault. Working professionals taking CE courses sign in here too.",
      "Tu portal tiene tus tickets, los mensajes del personal y tu archivo de documentos. Los profesionales que toman cursos de educación continua también inician sesión aquí.",
    ),
    portalEyebrow: b("Portal", "Portal"),
    portalTitle: b("Sign in", "Iniciar sesión"),
    portalBody: b(
      "Tickets, messages, documents, and CE progress.",
      "Tickets, mensajes, documentos y progreso en educación continua.",
    ),
    supportEyebrow: b("Support", "Soporte"),
    supportTitle: b("Open a ticket", "Abrir un ticket"),
    supportBody: b(
      "Academic, tuition, scheduling, or tech help. No sign-in needed.",
      "Ayuda académica, de matrícula, de horarios o técnica. No necesitas iniciar sesión.",
    ),
  },
};
