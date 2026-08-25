import type { Bilingual } from "./LanguageProvider";
import { REGISTRATION_FEE, SEAT_DEPOSIT, BALANCE_AFTER_DEPOSIT } from "@/lib/payment";

/**
 * EN/ES copy for /register — the Entry Level Dental Assisting enrollment hub.
 *
 * Flow agreed with Ashley for 2026-08-25:
 *   Website Apply → Atticus registration → $150 QuickBooks payment →
 *   Confirmation → student record / admissions
 *
 * This page closes the old dead end (Apply → Atticus → nothing). Step 1 sends
 * the student to Atticus; Step 2 is the QBO Buy Button; "What happens next"
 * is the confirmation content, since QuickBooks issues the receipt.
 *
 * Numbers come from lib/payment.ts. Do not hard-code dollar amounts here.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

export const register = {
  eyebrow: b("Enroll · Entry Level Dental Assisting", "Inscripción · Asistencia Dental de Nivel Inicial"),
  h1: b("Secure your seat.", "Asegura tu cupo."),
  lede: b(
    `Two steps to get started: apply through Atticus, then pay the ${REGISTRATION_FEE} registration fee online. A FIDA advisor follows up within one business day.`,
    `Dos pasos para comenzar: postúlate con Atticus y luego paga la cuota de inscripción de ${REGISTRATION_FEE} en línea. Un asesor de FIDA te dará seguimiento en un día hábil.`,
  ),

  step1Label: b("Step 1", "Paso 1"),
  step1Title: b("Apply through Atticus", "Postúlate con Atticus"),
  step1Body: b(
    "Atticus is our admissions intake — about five minutes. It captures your background, schedule, and the class you're aiming for, and creates your student record.",
    "Atticus es nuestro sistema de admisiones: unos cinco minutos. Registra tu experiencia, horario y la clase que te interesa, y crea tu expediente de estudiante.",
  ),
  step1Cta: b("Start my application", "Iniciar mi solicitud"),
  step1Done: b("Already applied? Go to Step 2.", "¿Ya te postulaste? Pasa al Paso 2."),

  step2Label: b("Step 2", "Paso 2"),
  step2Title: b(
    `Pay the ${REGISTRATION_FEE} registration fee`,
    `Paga la cuota de inscripción de ${REGISTRATION_FEE}`,
  ),
  step2Body: b(
    "Paid securely through QuickBooks — credit or debit card, bank transfer (ACH), PayPal, or Venmo. Opens in a new tab; QuickBooks emails your receipt.",
    "Se paga de forma segura a través de QuickBooks: tarjeta de crédito o débito, transferencia bancaria (ACH), PayPal o Venmo. Se abre en una pestaña nueva; QuickBooks te envía el recibo por correo.",
  ),
  step2Cta: b(
    "Secure My Seat – Pay Registration Fee",
    "Asegura mi cupo – Pagar cuota de inscripción",
  ),
  step2Note: b(
    "Use the same name and email you gave Atticus so we can match your payment to your application.",
    "Usa el mismo nombre y correo que le diste a Atticus para que podamos vincular tu pago con tu solicitud.",
  ),

  nextEyebrow: b("What happens next", "Qué sigue"),
  nextHeading: b(
    "After your registration fee is in, here's the path to your first day.",
    "Una vez recibida tu cuota de inscripción, este es el camino hasta tu primer día.",
  ),
  next: [
    {
      title: b("Admissions interview & campus tour", "Entrevista de admisión y recorrido del campus"),
      body: b(
        "A FIDA advisor contacts you within one business day to schedule your interview and a tour of our Jacksonville campus.",
        "Un asesor de FIDA te contacta en un día hábil para programar tu entrevista y un recorrido por nuestro campus en Jacksonville.",
      ),
    },
    {
      title: b(`${SEAT_DEPOSIT} seat deposit`, `Depósito de cupo de ${SEAT_DEPOSIT}`),
      body: b(
        "Once you're admitted, the deposit reserves your seat in a specific class. Card, ACH, check, or cash.",
        "Una vez admitido, el depósito reserva tu cupo en una clase específica. Tarjeta, ACH, cheque o efectivo.",
      ),
    },
    {
      title: b("Choose your payment plan", "Elige tu plan de pago"),
      body: b(
        `The ${BALANCE_AFTER_DEPOSIT} balance goes on an interest-free 6- or 8-month in-house plan, or an 18-month plan through TFC Tuition Financing. Your advisor sets it up with you.`,
        `El saldo de ${BALANCE_AFTER_DEPOSIT} se paga en un plan interno sin intereses de 6 u 8 meses, o en un plan de 18 meses a través de TFC Tuition Financing. Tu asesor lo configura contigo.`,
      ),
    },
    {
      title: b("Enrollment paperwork & first day", "Documentación de inscripción y primer día"),
      body: b(
        "Sign the program registration forms, submit your vaccination records, and get your class start date, scrubs, and clinical kit details.",
        "Firma los formularios de inscripción del programa, entrega tus comprobantes de vacunación y recibe la fecha de inicio, los uniformes y los detalles de tu kit clínico.",
      ),
    },
  ],

  classesEyebrow: b("Upcoming classes", "Próximas clases"),
  tuitionLink: b("See full tuition & payment plans", "Ver matrícula y planes de pago completos"),
  questionsLink: b("Questions? Ask Atticus", "¿Preguntas? Pregúntale a Atticus"),
};
