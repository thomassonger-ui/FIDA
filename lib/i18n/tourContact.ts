import type { Bilingual } from "./LanguageProvider";

/**
 * EN/ES copy for /tour (Schedule a Tour) and /contact.
 *
 * Content sourced from the legacy fldentalassisting.com /schedule-a-tour and
 * /contact pages (archived 2026-08-18); these are the 301 targets after the
 * domain merge.
 *
 * COMPLIANCE — no SMS consent language anywhere (SMS channel removed in the
 * 2026-05 review). Contact form logs into the ticket system, not email.
 * "By the numbers" stats are school-verifiable claims carried from the old
 * site — founded 2018, 378 program hours; graduate counts pending
 * Debbie/Ashley sign-off are NOT repeated here.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

/* ---------------------------------------------------------------- TOUR --- */

export const tour = {
  eyebrow: b("Visit us", "Visítanos"),
  heading: b("Schedule a tour.", "Agenda una visita."),
  intro: b(
    "Are you ready to open a doorway to a new career? Come visit our Jacksonville facility, meet your instructors, see what dental assisting classes are like — and get ready to change your future.",
    "¿Listo para abrir la puerta a una nueva carrera? Ven a conocer nuestras instalaciones en Jacksonville, conoce a tus instructoras, mira cómo son las clases de asistencia dental — y prepárate para cambiar tu futuro.",
  ),
  note: b(
    "A personal interview and facility tour are part of admission to the Entry Level Dental Assisting diploma program — so your visit isn't just a look around, it's your first official step.",
    "La entrevista personal y el recorrido por las instalaciones forman parte de la admisión al programa de diploma de Asistencia Dental de Nivel Inicial — así que tu visita no es solo un vistazo: es tu primer paso oficial.",
  ),
  bookEyebrow: b("Pick a time", "Elige un horario"),
  bookHeading: b(
    "Book directly with Debbie or Ashley.",
    "Reserva directamente con Debbie o Ashley.",
  ),
  bookBody: b(
    "Choose a slot that works for you — they'll walk you through the campus, the program, and every question you bring.",
    "Elige el horario que te convenga: te mostrarán el campus, el programa y responderán todas tus preguntas.",
  ),
  bookCta: b("Schedule my tour", "Agendar mi visita"),
  visitEyebrow: b("Where to find us", "Dónde estamos"),
  visitHeading: b("Jacksonville, Florida", "Jacksonville, Florida"),
  address: "8761 Perimeter Park Blvd, Ste. 107, Jacksonville, FL 32216",
  phoneLabel: b("Call us", "Llámanos"),
  hoursLabel: b("Office hours", "Horario de oficina"),
  hours: b("9 a.m. – 3 p.m.", "9 a.m. – 3 p.m."),
  numbersEyebrow: b("By the numbers", "En números"),
  numbersHeading: b(
    "Our dental assisting school at a glance.",
    "Nuestra escuela de asistencia dental en cifras.",
  ),
  numbers: [
    {
      stat: "2018",
      label: b("Founded in Jacksonville", "Fundada en Jacksonville"),
    },
    {
      stat: "378",
      label: b(
        "Clock hours in the entry-level program",
        "Horas reloj en el programa de nivel inicial",
      ),
    },
    {
      stat: "30+",
      label: b(
        "Years of combined dentistry experience",
        "Años de experiencia combinada en odontología",
      ),
    },
    {
      stat: "1:12",
      label: b(
        "Instructor-to-student ratio",
        "Proporción instructor–estudiante",
      ),
    },
  ],
  ctaHeading: b(
    "Can't make it in person?",
    "¿No puedes venir en persona?",
  ),
  ctaBody: b(
    "Start with Atticus, our admissions intake — five minutes, and a FIDA advisor follows up within one business day.",
    "Comienza con Atticus, nuestro sistema de admisiones: cinco minutos, y un asesor de FIDA te dará seguimiento en un día hábil.",
  ),
  ctaButton: b("Talk to Atticus", "Habla con Atticus"),
};

/* ------------------------------------------------------------- CONTACT --- */

export const contact = {
  eyebrow: b("Contact", "Contacto"),
  heading: b("Our team is here for you.", "Nuestro equipo está aquí para ti."),
  intro: b(
    "Questions about programs, tuition, schedules, or anything else? Send us a message — it goes straight to our support queue and a FIDA staff member replies within one business day.",
    "¿Preguntas sobre programas, matrícula, horarios o cualquier otro tema? Envíanos un mensaje: llega directo a nuestra bandeja de soporte y un miembro del personal de FIDA responde en un día hábil.",
  ),

  visitEyebrow: b("Visit us", "Visítanos"),
  callEyebrow: b("Call us", "Llámanos"),
  hoursEyebrow: b("Office hours", "Horario de oficina"),
  hours: b("9 a.m. – 3 p.m.", "9 a.m. – 3 p.m."),
  tourLink: b("Schedule a tour", "Agenda una visita"),

  formEyebrow: b("Send a message", "Envía un mensaje"),
  formHeading: b("Tell us what you need", "Cuéntanos qué necesitas"),
  formBody: b(
    "We'll confirm to your email and follow up there. Your message is logged in our support system — nothing gets lost in an inbox.",
    "Te enviaremos una confirmación a tu correo y daremos seguimiento allí. Tu mensaje queda registrado en nuestro sistema de soporte: nada se pierde en una bandeja de entrada.",
  ),
  nameLabel: b("Your name", "Tu nombre"),
  emailLabel: b("Email", "Correo electrónico"),
  phoneLabel: b("Phone (optional)", "Teléfono (opcional)"),
  messageLabel: b("Message", "Mensaje"),
  consent: b(
    "By submitting, you agree FIDA may contact you about your inquiry by email or phone. No marketing texts, ever.",
    "Al enviar, aceptas que FIDA se comunique contigo sobre tu consulta por correo o teléfono. Nunca mensajes de texto publicitarios.",
  ),
  submit: b("Send message", "Enviar mensaje"),
  sending: b("Sending…", "Enviando…"),
  successHeading: b("Message received.", "Mensaje recibido."),
  successBody: b(
    "Thanks — a FIDA staff member will reply to your email within one business day.",
    "Gracias — un miembro del personal de FIDA responderá a tu correo en un día hábil.",
  ),
  errGeneric: b(
    "Something went wrong. Please try again, or call us at (904) 674-3131.",
    "Algo salió mal. Inténtalo de nuevo o llámanos al (904) 674-3131.",
  ),
};
