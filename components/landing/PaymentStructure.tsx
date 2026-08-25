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

      {/* STAGES */}
      <ol className={`${showHeading ? "mt-10" : ""} grid grid-cols-1 md:grid-cols-3 gap-4`}>
        {p.stages.map((s) => (
          <li key={s.step} className="card bg-white p-6 flex flex-col">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                {t({ en: `Step ${s.step}`, es: `Paso ${s.step}` })}
              </span>
              <span className="font-display text-3xl text-navy">{s.amount}</span>
            </div>
            <div className="mt-2 font-display text-lg text-navy">{t(s.title)}</div>
            <p className="mt-2 text-sm text-muted leading-relaxed">{t(s.body)}</p>
          </li>
        ))}
      </ol>

      {/* TIERS */}
      <h3 className="mt-12 font-display text-2xl text-navy">{t(p.tiersHeading)}</h3>
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Standard */}
        <div className="card bg-white p-6 md:p-8">
          <div className="font-display text-xl text-navy">{t(p.tiers.standard.title)}</div>
          <div className="mt-4 font-display text-5xl text-teal">{p.tiers.standard.total}</div>
          <div className="mt-1 text-sm text-muted">{t(p.tiers.standard.totalNote)}</div>
          <div className="mt-5 text-navy font-semibold">{t(p.tiers.standard.balance)}</div>
          <ul className="mt-3 space-y-1.5">
            {p.tiers.standard.plans.map((pl) => (
              <li key={pl.en} className="flex items-start gap-3 text-navy">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                <span>{t(pl)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{t(p.tiers.standard.plansNote)}</p>
        </div>

        {/* Military / first responder */}
        <div className="card bg-white p-6 md:p-8 border-teal/40">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="font-display text-xl text-navy">{t(p.tiers.military.title)}</div>
            <span className="inline-block rounded-full bg-teal/10 text-teal text-xs font-semibold px-3 py-1">
              {t(p.tiers.military.badge)}
            </span>
          </div>
          <div className="mt-4 font-display text-5xl text-teal">{p.tiers.military.total}</div>
          <div className="mt-1 text-sm text-muted">{t(p.tiers.military.totalNote)}</div>
          <div className="mt-5 text-navy font-semibold">{t(p.tiers.military.balance)}</div>
          <ul className="mt-3 space-y-1.5">
            {p.tiers.military.plans.map((pl) => (
              <li key={pl.en} className="flex items-start gap-3 text-navy">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                <span>{t(pl)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">{t(p.tiers.military.plansNote)}</p>
        </div>
      </div>

      {/* METHODS + TFC */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card bg-white p-6">
          <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
            {t(p.methodsLabel)}
          </div>
          <div className="mt-2 text-navy">{t(p.methods)}</div>
        </div>
        <div className="card bg-white p-6">
          <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
            {t(p.tfcLabel)}
          </div>
          <p className="mt-2 text-navy leading-relaxed">{t(p.tfcBody)}</p>
          <Link
            href={TFC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-teal font-semibold hover:underline underline-offset-4"
          >
            {t(p.tfcCta)} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
