import type { Bilingual } from "@/lib/i18n/LanguageProvider";

/**
 * SINGLE SOURCE OF TRUTH for Entry Level Dental Assisting pricing and the
 * enrollment payment flow.
 *
 * CONFIRMED by Ashley (via Tom, 2026-08-25):
 *   - $150 registration fee, paid ONLINE at registration through the
 *     QuickBooks Online "Buy Button" (QBO Payments: card / ACH / PayPal /
 *     Venmo). Kept in QBO — not PayPal — so registration + tuition A/R stay
 *     in one ledger for the CPA.
 *   - $750 seat deposit secures the seat (collected after admissions). The
 *     $150 registration fee COUNTS TOWARD it, so $600 is actually due at
 *     that step (Tom, 2026-09-02). $150 + $600 + $9,100 = $9,850.
 *   - $9,700 tuition. After the deposit, $9,100 is financed.
 *   - In-house, interest-free: 6 months $1,516.66/mo or 8 months $1,137.50/mo.
 *   - Military / first responder: $1,500 off → $8,350 total, $7,600 financed
 *     after the $750 deposit. Verified with a military ID or DD214.
 *   - Accepted: card, ACH, check, cash.
 *   - Third-party: TFC Tuition Financing, 18-month plan.
 *
 * Flow (Tom, agreed with Ashley for 2026-08-25):
 *   Website Apply → Registration → $150 QBO payment → Confirmation → student record
 *
 * Pages that read this file: /register, /tuition, /programs/entry-level-
 * dental-assisting, /atticus, and the Atticus API prompt. Change numbers here
 * only.
 */

const b = (en: string, es: string): Bilingual => ({ en, es });

/* ---- Links ---- */

/** QuickBooks Online Buy Button — $150 registration fee. Opens in a new tab. */
export const QBO_REGISTRATION_URL =
  "https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-6ebd237e819646d4a7b5338b9edc4df60ca2d513149a49fb8bf33283208f96bab55cd5e6f2f643098f0225351d231c0e-0?locale=EN_US&cta=paylinkbuybutton";

/** Calendly — campus tour. The FIRST step of enrolling (agreed 2026-09-02). */
export const CALENDLY_TOUR_URL = "https://calendly.com/fldentalassisting";

/** TFC Tuition Financing — third-party 18-month plan. */
export const TFC_URL = "https://www.tfctuition.com/";

/* ---- Amounts (display strings; keep formatting consistent site-wide) ---- */

export const REGISTRATION_FEE = "$150";
export const SEAT_DEPOSIT = "$750";
/** What's actually due at the deposit step — the $150 registration counts toward the $750. */
export const SEAT_DEPOSIT_DUE = "$600";
export const TUITION = "$9,700";
export const TOTAL_COST = "$9,850"; // tuition + registration
export const BALANCE_AFTER_DEPOSIT = "$9,100";
export const PLAN_6_MONTHLY = "$1,516.66";
export const PLAN_8_MONTHLY = "$1,137.50";

export const MILITARY_DISCOUNT = "$1,500";
export const MILITARY_TUITION = "$8,350";
export const MILITARY_BALANCE_AFTER_DEPOSIT = "$7,600";
// Ashley: "Payment options are still the same" on the reduced balance.
// $7,600 / 6 = $1,266.67 · $7,600 / 8 = $950.00
export const MILITARY_PLAN_6_MONTHLY = "$1,266.67";
export const MILITARY_PLAN_8_MONTHLY = "$950";

/* ---- Copy blocks shared by /tuition and the ELDA program page ---- */

export const paymentCopy = {
  /* The section now LEADS with tuition and plans, because that is what people
     come to /tuition#payment for. "How payment works / Four steps" used to be
     the section heading; it moved down to sit with the four stage cards it
     actually describes (stagesEyebrow / stagesHeading below). */
  eyebrow: b("Tuition & payment plans", "Matrícula y planes de pago"),
  heading: b(
    "What it costs, and how you pay.",
    "Cuánto cuesta y cómo se paga.",
  ),

  stagesEyebrow: b("How payment works", "Cómo funciona el pago"),
  stagesHeading: b(
    "Four steps — you always know what's due and when.",
    "Cuatro pasos: siempre sabrás qué se debe y cuándo.",
  ),

  stages: [
    {
      step: "1",
      amount: "Free",
      title: b("Book a campus tour", "Reserva un recorrido"),
      body: b(
        "Everything starts with a visit. Pick a time on our calendar, see the classroom and lab, meet Debbie and Ashley, and decide if FIDA is right for you. Nothing to pay yet.",
        "Todo empieza con una visita. Elige una hora en nuestro calendario, conoce el aula y el laboratorio, conoce a Debbie y Ashley, y decide si FIDA es para ti. Todavía no se paga nada.",
      ),
      cta: { label: b("Book my tour", "Reservar mi recorrido"), href: CALENDLY_TOUR_URL },
    },
    {
      step: "2",
      amount: REGISTRATION_FEE,
      title: b("Registration fee", "Cuota de inscripción"),
      body: b(
        "After your tour, when you've decided to enroll. Paid online through QuickBooks — card, bank transfer (ACH), PayPal, or Venmo. Non-refundable; it counts toward your seat deposit.",
        "Después de tu recorrido, cuando hayas decidido inscribirte. Se paga en línea a través de QuickBooks: tarjeta, transferencia bancaria (ACH), PayPal o Venmo. No reembolsable; se acredita a tu depósito de cupo.",
      ),
    },
    {
      /* The figure shown is what you actually PAY here, not the deposit's face
         value. This card used to read $750 while the body explained that only
         $600 was due, which contradicted the section's own promise that you
         always know what's due. $750 still appears, in the title, where it
         belongs. */
      step: "3",
      amount: SEAT_DEPOSIT_DUE,
      title: b(
        `Seat deposit (${SEAT_DEPOSIT})`,
        `Depósito de cupo (${SEAT_DEPOSIT})`,
      ),
      body: b(
        `Due once your online application and enrollment agreement are in — this is what reserves your seat in a specific class. Your ${REGISTRATION_FEE} registration counts toward the ${SEAT_DEPOSIT}, so ${SEAT_DEPOSIT_DUE} is due here.`,
        `Se paga cuando tu solicitud en línea y tu acuerdo de inscripción estén completos: es lo que reserva tu cupo en una clase específica. Tu inscripción de ${REGISTRATION_FEE} se acredita al depósito de ${SEAT_DEPOSIT}, así que aquí se pagan ${SEAT_DEPOSIT_DUE}.`,
      ),
    },
    {
      step: "4",
      amount: BALANCE_AFTER_DEPOSIT,
      title: b("Tuition balance", "Saldo de matrícula"),
      body: b(
        "Choose an interest-free in-house plan or an 18-month plan through TFC. Your advisor sets it up with you before class starts.",
        "Elige un plan interno sin intereses o un plan de 18 meses con TFC. Tu asesor lo configura contigo antes de que empiecen las clases.",
      ),
    },
  ],

  tiersHeading: b("Tuition & payment plans", "Matrícula y planes de pago"),
  /* Promoted from a grey footnote to a badge on the card. It is the strongest
     thing on this page and only true of the in-house 6- and 8-month plans —
     never of TFC, which is why the TFC card now states its APR. */
  interestFreeBadge: b("Interest-free", "Sin intereses"),
  tiers: {
    standard: {
      title: b("Standard tuition", "Matrícula estándar"),
      total: TUITION,
      totalNote: b(
        `+ ${REGISTRATION_FEE} registration = ${TOTAL_COST} total`,
        `+ ${REGISTRATION_FEE} de inscripción = ${TOTAL_COST} en total`,
      ),
      balance: b(
        `${BALANCE_AFTER_DEPOSIT} balance after the ${SEAT_DEPOSIT} seat deposit`,
        `Saldo de ${BALANCE_AFTER_DEPOSIT} después del depósito de ${SEAT_DEPOSIT}`,
      ),
      plans: [
        b(`6 months · ${PLAN_6_MONTHLY}/month`, `6 meses · ${PLAN_6_MONTHLY}/mes`),
        b(`8 months · ${PLAN_8_MONTHLY}/month`, `8 meses · ${PLAN_8_MONTHLY}/mes`),
      ],
      plansNote: b(
        "In-house plans are interest-free.",
        "Los planes internos no tienen intereses.",
      ),
    },
    military: {
      title: b(
        "Military & first responder tuition",
        "Matrícula para militares y primeros respondientes",
      ),
      badge: b(`${MILITARY_DISCOUNT} appreciation incentive`, `Incentivo de reconocimiento de ${MILITARY_DISCOUNT}`),
      total: MILITARY_TUITION,
      totalNote: b(
        `+ ${REGISTRATION_FEE} registration`,
        `+ ${REGISTRATION_FEE} de inscripción`,
      ),
      balance: b(
        `${MILITARY_BALANCE_AFTER_DEPOSIT} balance after the ${SEAT_DEPOSIT} seat deposit`,
        `Saldo de ${MILITARY_BALANCE_AFTER_DEPOSIT} después del depósito de ${SEAT_DEPOSIT}`,
      ),
      plans: [
        b(
          `6 months · ${MILITARY_PLAN_6_MONTHLY}/month`,
          `6 meses · ${MILITARY_PLAN_6_MONTHLY}/mes`,
        ),
        b(
          `8 months · ${MILITARY_PLAN_8_MONTHLY}/month`,
          `8 meses · ${MILITARY_PLAN_8_MONTHLY}/mes`,
        ),
      ],
      plansNote: b(
        "Same interest-free in-house plans. Eligibility is verified with a valid military ID or DD214 before the incentive is applied.",
        "Los mismos planes internos sin intereses. La elegibilidad se verifica con una identificación militar vigente o el formulario DD214 antes de aplicar el incentivo.",
      ),
    },
  },

  /* Named at last. The 6- and 8-month plans ARE the in-house financing, but
     the page never called them that — they were bullets under a grey footnote.
     It is the option most students use, so it gets a heading of its own inside
     each tuition card, directly above its own numbers. */
  inHouseLabel: b("In-house financing", "Financiamiento interno"),
  inHouseBadge: b("0% interest", "0% de interés"),

  methodsLabel: b("Accepted payment methods", "Métodos de pago aceptados"),
  /* A list, not a run-on line, so each method renders as its own chip. A wall
     of text separated by middots does not scan. */
  methodsList: [
    b("Credit or debit card", "Tarjeta de crédito o débito"),
    b("Bank transfer (ACH)", "Transferencia bancaria (ACH)"),
    b("Check", "Cheque"),
    b("Cash", "Efectivo"),
  ],
  methods: b(
    "Credit or debit card · Bank transfer (ACH) · Check · Cash",
    "Tarjeta de crédito o débito · Transferencia bancaria (ACH) · Cheque · Efectivo",
  ),

  /* Named as financing, not as a question. Around 60% of registrations use a
     payment plan, so both routes carry the word "financing" and sit together
     as a pair of options rather than one being a footnote to the other. */
  tfcLabel: b("TFC financing · 18 months", "Financiamiento TFC · 18 meses"),
  /* The APR was missing, which let TFC read as a free alternative to the
     in-house plans. It isn't: the enrollment agreement discloses 3% for the
     first six months, then 8% for the remaining twelve. Stating it here is
     both honest and what makes the interest-free in-house plans land. */
  tfcBody: b(
    "TFC Tuition Financing spreads the balance over 18 months. No credit check — but unlike our in-house plans it carries interest: 3% APR for the first 6 months, then 8% for the remaining 12. Approval is subject to TFC's terms.",
    "TFC Tuition Financing distribuye el saldo en 18 meses. Sin verificación de crédito, pero a diferencia de nuestros planes internos sí genera intereses: 3% APR los primeros 6 meses y 8% los 12 restantes. La aprobación está sujeta a los términos de TFC.",
  ),
  tfcCta: b("Learn about TFC", "Conoce TFC"),

  registerCta: b(
    "Secure My Seat – Pay Registration Fee",
    "Asegura mi cupo – Pagar cuota de inscripción",
  ),
};
