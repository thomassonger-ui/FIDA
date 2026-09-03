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
  eyebrow: b("How payment works", "Cómo funciona el pago"),
  heading: b(
    "Three stages — you always know what's due and when.",
    "Tres etapas: siempre sabrás qué se debe y cuándo.",
  ),

  stages: [
    {
      step: "1",
      amount: REGISTRATION_FEE,
      title: b("Registration fee", "Cuota de inscripción"),
      body: b(
        "Paid online when you register. Secures your place in the admissions process and is collected through QuickBooks — card, bank transfer (ACH), PayPal, or Venmo.",
        "Se paga en línea al inscribirte. Asegura tu lugar en el proceso de admisión y se cobra a través de QuickBooks: tarjeta, transferencia bancaria (ACH), PayPal o Venmo.",
      ),
    },
    {
      step: "2",
      amount: SEAT_DEPOSIT,
      title: b("Seat deposit", "Depósito de cupo"),
      body: b(
        "Due after your admissions interview and campus tour — this is what reserves your seat in a specific class. Your $150 registration fee counts toward it, so $600 is due at this step.",
        "Se paga después de tu entrevista de admisión y recorrido del campus: es lo que reserva tu cupo en una clase específica. Tu cuota de inscripción de $150 se acredita al depósito, así que en esta etapa se pagan $600.",
      ),
    },
    {
      step: "3",
      amount: BALANCE_AFTER_DEPOSIT,
      title: b("Tuition balance", "Saldo de matrícula"),
      body: b(
        "Choose an interest-free in-house plan or an 18-month plan through TFC. Your advisor sets it up with you before class starts.",
        "Elige un plan interno sin intereses o un plan de 18 meses con TFC. Tu asesor lo configura contigo antes de que empiecen las clases.",
      ),
    },
  ],

  tiersHeading: b("Tuition & payment plans", "Matrícula y planes de pago"),
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

  methodsLabel: b("Accepted payment methods", "Métodos de pago aceptados"),
  methods: b(
    "Credit or debit card · Bank transfer (ACH) · Check · Cash",
    "Tarjeta de crédito o débito · Transferencia bancaria (ACH) · Cheque · Efectivo",
  ),

  tfcLabel: b("Prefer a longer term?", "¿Prefieres un plazo más largo?"),
  tfcBody: b(
    "FIDA partners with TFC Tuition Financing for an 18-month tuition payment plan. No credit check — approval is subject to TFC's program terms.",
    "FIDA colabora con TFC Tuition Financing para un plan de pago de matrícula de 18 meses. Sin verificación de crédito: la aprobación está sujeta a los términos del programa de TFC.",
  ),
  tfcCta: b("Learn about TFC", "Conoce TFC"),

  registerCta: b(
    "Secure My Seat – Pay Registration Fee",
    "Asegura mi cupo – Pagar cuota de inscripción",
  ),
};
