"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { paymentCopy as p, TFC_URL } from "@/lib/payment";

/**
 * Entry Level Dental Assisting payment structure — registration fee → seat
 * deposit → tuition balance, the two tuition tiers, accepted methods, TFC.
 *
 * Rendered on /tuition (diploma section) and on the ELDA program page (cost
 * section). All numbers come from lib/payment.ts.
 *
 * `showHeading` — set false where the parent already prints a section heading.
 */
/**
 * One card, four uses. Defined at module scope (not inside PaymentStructure)
 * so React keeps its identity across renders — an inline component would be a
 * new type every render and would drop focus and state.
 */
function PayCard({
  title,
  badge,
  price,
  priceNote,
  lead,
  bullets,
  body,
  footnote,
  link,
}: {
  title: string;
  badge?: string;
  price?: string;
  priceNote?: string;
  lead?: string;
  bullets?: string[];
  body?: string;
  footnote?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="card bg-white p-6 md:p-8 flex flex-col border-teal/40">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="font-display text-xl text-navy">{title}</div>
        {badge ? (
          <span className="inline-block rounded-full bg-teal/10 text-teal text-xs font-semibold px-3 py-1">
            {badge}
          </span>
        ) : null}
      </div>

      {price ? (
        <>
          <div className="mt-4 font-display text-5xl text-teal">{price}</div>
          {priceNote ? <div className="mt-1 text-sm text-muted">{priceNote}</div> : null}
        </>
      ) : null}

      {lead ? <div className="mt-5 text-navy font-semibold">{lead}</div> : null}

      {bullets?.length ? (
        <ul className="mt-3 space-y-1.5">
          {bullets.map((bl) => (
            <li key={bl} className="flex items-start gap-3 text-navy">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
              <span>{bl}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {body ? <p className="mt-4 text-navy leading-relaxed">{body}</p> : null}

      {link ? (
        <Link
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block w-fit text-teal font-semibold hover:underline underline-offset-4"
        >
          {link.label} <span aria-hidden="true">↗</span>
        </Link>
      ) : null}

      {/* mt-auto pins the footnote to the bottom so cards of different content
          lengths still line up along their base. */}
      {footnote ? <p className="mt-auto pt-3 text-sm text-muted">{footnote}</p> : null}
    </div>
  );
}

export function PaymentStructure({ showHeading = true }: { showHeading?: boolean }) {
  const { t } = useLang();

  return (
    <div>
      {showHeading && (
        <div className="max-w-3xl">
          <div className="eyebrow">{t(p.eyebrow)}</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
            {t(p.heading)}
          </h2>
        </div>
      )}

      {/*
        One card system throughout — same border, title, badge pill, padding —
        so the four read as a set. Paired like with like, because a tuition
        card runs roughly twice the height of an info card: putting one beside
        the other left a large empty box.

          Row 1  Standard | Military          the two prices, identical cards
          Row 2  TFC      | Accepted methods  the two short info cards

        Reads as: here is the price, here is how you spread it, here is what we
        take. The four-stage registration → deposit → balance sequence used to
        open this section and now sits below — people arrive at #payment
        wanting the price, not the process.
      */}
      <div className={`${showHeading ? "mt-8" : "mt-2"} grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch`}>
        {/* Standard tuition. Interest-free is the headline, not a footnote. */}
        <PayCard
          title={t(p.tiers.standard.title)}
          badge={t(p.interestFreeBadge)}
          price={p.tiers.standard.total}
          priceNote={t(p.tiers.standard.totalNote)}
          lead={t(p.tiers.standard.balance)}
          bullets={p.tiers.standard.plans.map((pl) => t(pl))}
          footnote={t(p.tiers.standard.plansNote)}
        />

        {/* Military & first responder. Identical card, different numbers. */}
        <PayCard
          title={t(p.tiers.military.title)}
          badge={t(p.tiers.military.badge)}
          price={p.tiers.military.total}
          priceNote={t(p.tiers.military.totalNote)}
          lead={t(p.tiers.military.balance)}
          bullets={p.tiers.military.plans.map((pl) => t(pl))}
          footnote={t(p.tiers.military.plansNote)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* TFC. States its APR, so the contrast with interest-free is honest. */}
        <PayCard
          title={t(p.tfcLabel)}
          body={t(p.tfcBody)}
          link={{ href: TFC_URL, label: t(p.tfcCta) }}
        />

        {/* Accepted payment methods. */}
        <PayCard title={t(p.methodsLabel)} body={t(p.methods)} />
      </div>

      {/* HOW THE PAYMENTS FALL — the sequence, after the prices. */}
      <div className="mt-14 max-w-3xl">
        <div className="eyebrow">{t(p.stagesEyebrow)}</div>
        <h3 className="mt-3 font-display text-2xl md:text-3xl text-navy tracking-tight">
          {t(p.stagesHeading)}
        </h3>
      </div>
      <ol className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {p.stages.map((s) => (
          <li key={s.step} className="card bg-white p-6 flex flex-col">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                {t({ en: `Step ${s.step}`, es: `Paso ${s.step}` })}
              </span>
              <span className="font-display text-3xl text-navy">{s.amount}</span>
            </div>
            <div className="mt-2 font-display text-lg text-navy">{t(s.title)}</div>
            <p className="mt-2 text-sm text-muted leading-relaxed flex-1">{t(s.body)}</p>
            {"cta" in s && s.cta && (
              <a
                href={s.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-fit text-sm"
              >
                {t(s.cta.label)} <span aria-hidden="true">↗</span>
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
