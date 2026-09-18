import type { Bilingual } from "./LanguageProvider";
import { REGISTRATION_FEE, SEAT_DEPOSIT, BALANCE_AFTER_DEPOSIT } from "@/lib/payment";

/**
 * EN/ES copy for /register — the Entry Level Dental Assisting enrollment hub.
 *
 * Current flow — "Easy as 1-2-3", updated 2026-09-17:
 *   1. Free campus tour (Calendly)
 *   2. $150 registration fee (QuickBooks, opens in its own tab — Intuit
 *      sends x-frame-options SAMEORIGIN so it cannot be embedded here)
 *   3. Application + enrollment agreement, in an on-page modal
 *      (ApplicationModal → POST /api/register/start → the CIE 2024
 *      agreement rendered inline; the visitor never leaves this page)
 *
 * Step 3 used to hand off to Atticus, which is why some earlier copy said
 * "with Atticus". It doesn't any more. The only Atticus link left on the page
 * is "Questions? Ask Atticus" at the bottom, which is still what he's for.
 *
 * "What happens next" remains the confirmation content, since QuickBooks
 * issues the receipt for the registration fee.
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
  /* The \n is an intentional line break, rendered via whitespace-pre-line.
     "Book a campus tour" fitted on one line while "Complete your application"
     took two, so card 1's title block was shorter than card 3's and the row
     looked uneven. Breaking before "tour" gives all three titles two lines.
     Spanish already wraps to two lines on its own, so it carries no \n. */
  step0Title: b("Book a campus\ntour", "Reserva un recorrido del campus"),
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
  /* The amount is already the big price figure directly above this heading,
     so repeating it here was redundant and pushed the title onto two lines. */
  step2Title: b("Registration fee", "Cuota de inscripción"),
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
  /* Tightened 2026-09-18 — roughly half the previous words, same facts. The
     cards ARE the path, so the heading no longer says so; "FIDA" and
     "enrollment" came out where the context already supplies them.

     "Interest-free" was dropped from card 03 deliberately: it is true of the
     6- and 8-month in-house plans but NOT of TFC's 18 months, which carries
     3% then 8% APR (see THIRD_PARTY_LOAN). The old line implied it covered
     all three. Naming the three term lengths without the claim is accurate. */
  nextHeading: b("From application to first day.", "De la solicitud al primer día."),
  /* Bullets, not sentences. Nobody reads a paragraph in a card on a web page —
     they scan for the number, the noun and the amount. Each step is now 2-3
     fragments a person can take in at a glance, with the money first where
     money is the point. */
  next: [
    {
      title: b(`${SEAT_DEPOSIT} seat deposit`, `Depósito de cupo de ${SEAT_DEPOSIT}`),
      bullets: [
        b("$600 due here", "Aquí se pagan $600"),
        b("Your $150 counts toward it", "Tus $150 se acreditan"),
        b("Card, ACH, check or cash", "Tarjeta, ACH, cheque o efectivo"),
      ],
    },
    {
      title: b("We review", "Revisamos"),
      bullets: [
        b("Application & agreement", "Solicitud y acuerdo"),
        b("Payments confirmed", "Pagos confirmados"),
        b("A real advisor, not a form", "Un asesor real, no un formulario"),
      ],
    },
    {
      title: b("Acceptance email", "Correo de aceptación"),
      bullets: [
        b("Acceptance letter & catalog", "Carta de aceptación y catálogo"),
        b("Orientation date & start date", "Fecha de orientación e inicio"),
        b(
          `${BALANCE_AFTER_DEPOSIT} on a 6, 8 or 18-month plan`,
          `${BALANCE_AFTER_DEPOSIT} en un plan de 6, 8 o 18 meses`,
        ),
      ],
    },
    {
      title: b("Orientation & first day", "Orientación y primer día"),
      bullets: [
        b("Scrubs & clinical kit", "Uniformes y kit clínico"),
        b("Course access", "Acceso al curso"),
      ],
    },
  ],

  classesEyebrow: b("Upcoming classes", "Próximas clases"),
  tuitionLink: b("See full tuition & payment plans", "Ver matrícula y planes de pago completos"),
  questionsLink: b("Questions? Ask Atticus", "¿Preguntas? Pregúntale a Atticus"),
};
