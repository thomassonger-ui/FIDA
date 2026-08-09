import type { Bilingual } from "./LanguageProvider";

/**
 * EN/ES copy for the Atticus admissions intake widget.
 *
 * NOTE: the AI's *replies* are language-matched by the API (see the language
 * directive appended in app/api/atticus/route.ts). Only the shell — greeting,
 * quick prompts, disclosure, composer — lives here. The compliance guardrails
 * in the system prompt are untouched and apply in both languages.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

export const atticus = {
  // Homepage section wrapper
  sectionEyebrow: b("Admissions", "Admisiones"),
  sectionHeadingLead: b("Not sure where you fit? ", "¿No sabes cuál es tu lugar? "),
  sectionHeadingAccent: b("Start here.", "Empieza aquí."),
  sectionBody: b(
    "Tell us where you are today and we’ll point you to the right path — the Entry Level Dental Assisting diploma program, or an EFDA or Radiography course. Takes about five minutes, and a FIDA advisor follows up within one business day.",
    "Cuéntanos en qué punto estás y te indicaremos el camino adecuado: el programa de diploma de Asistencia Dental de Nivel Inicial, o un curso de EFDA o Radiografía. Toma unos cinco minutos, y un asesor de FIDA te dará seguimiento en un día hábil.",
  ),

  // Chat shell
  advisorRole: b("AI Admissions Advisor · online", "Asesor de Admisiones con IA · en línea"),
  logoRole: b("AI Admissions Advisor", "Asesor de Admisiones con IA"),
  opening: b(
    "Hi — I'm Atticus, the admissions advisor for Florida Institute of Dental Assisting. I can help you figure out which path fits — the Entry Level Dental Assisting diploma program (for new students) or one of our Professional Development courses (EFDA, Radiography). To start: are you currently working as a dental assistant in a Florida dental office?",
    "Hola, soy Atticus, el asesor de admisiones del Florida Institute of Dental Assisting. Puedo ayudarte a determinar qué camino te conviene: el programa de diploma de Asistencia Dental de Nivel Inicial (para estudiantes nuevos) o uno de nuestros Cursos de Desarrollo Profesional (EFDA, Radiografía). Para empezar: ¿trabajas actualmente como asistente dental en un consultorio de Florida?",
  ),
  quickPrompts: [
    b(
      "I want to change careers into healthcare.",
      "Quiero cambiar de carrera hacia el sector de la salud.",
    ),
    b("I'm not sure which program fits me.", "No sé qué programa me conviene."),
    b(
      "I need something flexible — I work full-time.",
      "Necesito algo flexible: trabajo tiempo completo.",
    ),
    b("What's the fastest path to a job?", "¿Cuál es el camino más rápido a un empleo?"),
  ],
  disclosureLead: b("Heads up:", "Aviso:"),
  disclosure: b(
    "Atticus is an AI admissions advisor — not a human and not a medical or legal professional. Please don’t share your SSN, insurance info, or medical history in chat. A real FIDA advisor follows up within one business day.",
    "Atticus es un asesor de admisiones con inteligencia artificial: no es una persona ni un profesional médico o legal. Por favor no compartas tu número de Seguro Social, información de seguro ni historial médico en el chat. Un asesor real de FIDA te dará seguimiento en un día hábil.",
  ),
  placeholder: b("Type your message...", "Escribe tu mensaje..."),
  send: b("Send", "Enviar"),
  errGeneric: b(
    "Atticus hit an error. Try again in a moment.",
    "Atticus tuvo un error. Inténtalo de nuevo en un momento.",
  ),
  errUnknown: b("Something went wrong.", "Algo salió mal."),
};
