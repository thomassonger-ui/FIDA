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
    `Three steps to get started: book a campus tour, pay the ${REGISTRATION_FEE} registration fee after you've decided, then complete your application. A FIDA advisor is with you the whole way.`,
    `Tres pasos para comenzar: reserva un recorrido del campus, paga la cuota de inscripción de ${REGISTRATION_FEE} cuando hayas decidido, y luego completa tu solicitud. Un asesor de FIDA te acompaña en todo el proceso.`,
  ),

  step0Label: b("Step 1", "Paso 1"),
  step0Title: b("Book a campus tour", "Reserva un recorrido del campus"),
  step0Body: b(
    "Everything starts with a visit. Pick a time on our calendar, see the classroom and lab, meet Debbie and Ashley, and ask anything. Free, no commitment.",
    "Todo empieza con una visita. Elige una hora en nuestro calendario, conoce el aula y el laboratorio, conoce a Debbie y Ashley y pregunta lo que quieras. Gratis, sin compromiso.",
  ),
  step0Cta: b("Book my tour", "Reservar mi recorrido"),
  step0Done: b("Already toured? Go to Step 2.", "¿Ya hiciste el recorrido? Pasa al Paso 2."),

  step1Label: b("Step 3", "Paso 3"),
  step1Title: b("Complete your application", "Completa tu solicitud"),
  /* Was "with Atticus" — that stopped being true when step 3 became the
     on-page application + agreement modal. */
  step1Body: b(
    "Your application and enrollment agreement open right here on this page — read it, initial it, sign it. About five minutes. Your seat deposit comes after that.",
    "Tu solicitud y tu acuerdo de inscripción se abren aquí mismo en esta página: léelo, pon tus iniciales y fírmalo. Unos cinco minutos. El depósito de cupo viene después.",
  ),
  step1Cta: b("Start my application", "Iniciar mi solicitud"),
  step1Done: b("Use the same name and email you used to pay.", "Usa el mismo nombre y correo con los que pagaste."),

  /* --- Application + e-sign modal. This is FIDA's own flow, so unlike the
     QuickBooks page it can be embedded — the visitor never leaves /register. --- */
  modal: {
    title: b("Your application", "Tu solicitud"),
    close: b("Close", "Cerrar"),
    introHeading: b("First, who are you?", "Primero, ¿quién eres?"),
    introBody: b(
      "Four details, then your enrollment agreement opens right here to read, initial and sign.",
      "Cuatro datos y tu acuerdo de inscripción se abre aquí mismo para leer, poner iniciales y firmar.",
    ),
    fullName: b("Full legal name", "Nombre legal completo"),
    email: b("Email", "Correo electrónico"),
    phone: b("Phone", "Teléfono"),
    cohort: b("Which class are you aiming for?", "¿A qué clase te diriges?"),
    cohortAny: b("Not sure yet", "Aún no estoy seguro"),
    submit: b("Continue to my agreement", "Continuar a mi acuerdo"),
    working: b("One moment…", "Un momento…"),
    errorGeneric: b(
      "Something went wrong on our end. Please try again, or call us and we'll finish this with you.",
      "Algo falló de nuestro lado. Inténtalo de nuevo o llámanos y lo completamos contigo.",
    ),
    errorEmail: b("Please enter a valid email address.", "Ingresa un correo electrónico válido."),
    errorName: b("Please enter your full legal name.", "Ingresa tu nombre legal completo."),
    alreadySigned: b(
      "Our records show this agreement is already signed. Call us and we'll sort it out.",
      "Según nuestros registros este acuerdo ya está firmado. Llámanos y lo resolvemos.",
    ),
    leaveWarning: b(
      "Close the application? Anything you've typed will be lost.",
      "¿Cerrar la solicitud? Se perderá lo que hayas escrito.",
    ),
  },

  step2Label: b("Step 2", "Paso 2"),
  step2Title: b(
    `Pay the ${REGISTRATION_FEE} registration fee`,
    `Paga la cuota de inscripción de ${REGISTRATION_FEE}`,
  ),
  step2Body: b(
    "After your tour, when you've decided to enroll. Non-refundable, and it counts toward your $750 seat deposit. Paid securely through QuickBooks — card, ACH, PayPal, or Venmo; opens in a new tab and QuickBooks emails your receipt.",
    "Después de tu recorrido, cuando hayas decidido inscribirte. No reembolsable, y se acredita a tu depósito de cupo de $750. Se paga de forma segura a través de QuickBooks: tarjeta, ACH, PayPal o Venmo; se abre en una pestaña nueva y QuickBooks te envía el recibo.",
  ),
  /* Short label on purpose. The old "Secure My Seat – Pay Registration Fee"
     wrapped to two lines, which made this card's button taller than the other
     two and threw the whole row out of alignment. The $150 is shown as its own
     price badge on the card, so the button doesn't need to carry it. */
  step2Cta: b("Secure My Seat", "Asegura mi cupo"),
  /* Kept to two lines at card width. The longer explanation is in step2Body;
     a third line here made this card's footer taller than its neighbours and
     lifted the button out of line with them. */
  step2Note: b(
    "Use the same name and email as your application.",
    "Usa el mismo nombre y correo de tu solicitud.",
  ),

  /* --- Easy as 1-2-3 framing + the free/paid split --- */
  easyHeading: b("Easy as 1-2-3", "Fácil como 1-2-3"),
  easySub: b(
    "One free visit, then two short steps. No surprises, and nothing is owed until you've seen the school.",
    "Una visita gratis y luego dos pasos breves. Sin sorpresas, y no pagas nada hasta conocer la escuela.",
  ),
  freeBadge: b("Free", "Gratis"),
  paidBadge: b("Paid step", "Paso con pago"),

  /* --- QuickBooks handoff. Intuit sends x-frame-options SAMEORIGIN, so their
     pay page cannot be embedded here; it has to open in its own tab. This
     panel keeps the visitor oriented on /register while that tab is open. --- */
  qboOpenedTitle: b("Finish your payment in the QuickBooks tab", "Completa tu pago en la pestaña de QuickBooks"),
  qboOpenedBody: b(
    "We opened QuickBooks in a new tab — card, ACH, PayPal or Venmo. They'll email your receipt. Come back here when you're done.",
    "Abrimos QuickBooks en una pestaña nueva: tarjeta, ACH, PayPal o Venmo. Te enviarán el recibo por correo. Vuelve aquí cuando termines.",
  ),
  qboPaidCta: b("I've paid — continue", "Ya pagué — continuar"),
  qboReopen: b("Reopen the payment tab", "Volver a abrir la pestaña de pago"),
  qboPaidNote: b(
    "We'll match your payment to your application by name and email.",
    "Vincularemos tu pago con tu solicitud por nombre y correo.",
  ),

  nextEyebrow: b("What happens next", "Qué sigue"),
  nextHeading: b(
    "After your application is in, here's the path to your first day.",
    "Una vez enviada tu solicitud, este es el camino hasta tu primer día.",
  ),
  next: [
    {
      title: b(`${SEAT_DEPOSIT} seat deposit`, `Depósito de cupo de ${SEAT_DEPOSIT}`),
      body: b(
        "Reserves your seat in a specific class. Your $150 registration counts toward it, so $600 is due here. Card, ACH, check, or cash.",
        "Reserva tu cupo en una clase específica. Tu inscripción de $150 se acredita, así que aquí se pagan $600. Tarjeta, ACH, cheque o efectivo.",
      ),
    },
    {
      title: b("We review & verify", "Revisamos y verificamos"),
      body: b(
        "FIDA reviews your application, enrollment agreement, and payments. Questions come from a real advisor, not a form.",
        "FIDA revisa tu solicitud, tu acuerdo de inscripción y tus pagos. Cualquier pregunta viene de un asesor real, no de un formulario.",
      ),
    },
    {
      title: b("Your acceptance email", "Tu correo de aceptación"),
      body: b(
        `Once approved: your acceptance letter, the school catalog, orientation details, and your class start date. The ${BALANCE_AFTER_DEPOSIT} balance goes on an interest-free 6- or 8-month plan, or 18 months through TFC.`,
        `Una vez aprobado: tu carta de aceptación, el catálogo de la escuela, los detalles de orientación y tu fecha de inicio. El saldo de ${BALANCE_AFTER_DEPOSIT} se paga en un plan sin intereses de 6 u 8 meses, o en 18 meses a través de TFC.`,
      ),
    },
    {
      title: b("Orientation & first day", "Orientación y primer día"),
      body: b(
        "Attend orientation, get your scrubs and clinical kit details, and receive access to your course for the class start.",
        "Asiste a la orientación, recibe tus uniformes y los detalles del kit clínico, y obtén acceso a tu curso para el inicio de clases.",
      ),
    },
  ],

  classesEyebrow: b("Upcoming classes", "Próximas clases"),
  tuitionLink: b("See full tuition & payment plans", "Ver matrícula y planes de pago completos"),
  questionsLink: b("Questions? Ask Atticus", "¿Preguntas? Pregúntale a Atticus"),
};
