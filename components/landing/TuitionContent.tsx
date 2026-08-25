"use client";

import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { APPLY_URL } from "@/lib/i18n/courseDetail";
import { tuition as tu } from "@/lib/i18n/tuition";
import { COHORTS } from "@/lib/cohort";
import { PaymentStructure } from "@/components/landing/PaymentStructure";

/**
 * /tuition body. Client component so the route stays a server component and
 * keeps its metadata + JSON-LD.
 */
export function TuitionContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HEADER */}
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(tu.eyebrow)}</div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(tu.heading)}
              </h1>
              <p className="mt-6 text-muted text-lg leading-relaxed">
                {t(tu.intro)}
              </p>
            </div>
          </div>
        </section>

        {/* DIPLOMA PRICING */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
          <div className="card bg-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-10">
                <div className="eyebrow">{t(tu.diploma.eyebrow)}</div>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                  {t(tu.diploma.title)}
                </h2>
                <p className="mt-2 text-teal font-semibold">
                  {t(tu.diploma.length)}
                </p>

                <div className="mt-6 font-display text-5xl text-teal">
                  {tu.diploma.price}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {t(tu.diploma.priceBreakdown)}
                </div>

                <div className="mt-4 text-sm text-navy">
                  <div className="font-semibold">{t(tu.diploma.nextCohortLabel)}</div>
                  <ul className="mt-1.5 space-y-1">
                    {COHORTS.map((c) => (
                      <li key={c.date.en}>
                        <span className="font-semibold">{t(c.date)}</span>
                        <span className="text-muted"> · {t(c.schedule)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-5 text-sm text-muted leading-relaxed">
                  {t(tu.diploma.financing)}
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link href="/register" className="btn-primary">
                    {t(tu.diploma.cta)} <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/programs/entry-level-dental-assisting"
                    className="btn-ghost"
                  >
                    {t(tu.diploma.detailsLink)}
                  </Link>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-paper-subtle border-t lg:border-t-0 lg:border-l border-rule">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                  {t(tu.diploma.includesHeading)}
                </div>
                <ul className="mt-5 space-y-3">
                  {tu.diploma.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-navy">
                      <span className="mt-1.5 w-5 h-5 rounded-full bg-teal/15 border border-teal/40 flex items-center justify-center flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                      </span>
                      <span className="text-sm leading-relaxed">{t(item)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* PAYMENT STRUCTURE — registration fee → deposit → balance, tiers, TFC */}
          <div id="payment" className="mt-14 md:mt-16 scroll-mt-24">
            <PaymentStructure />
          </div>
        </section>

        {/* CE COURSES */}
        <section className="bg-paper-subtle border-y border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl mb-10">
              <div className="eyebrow">{t(tu.ce.eyebrow)}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                {t(tu.ce.heading)}
              </h2>
              <p className="mt-4 text-muted leading-relaxed">{t(tu.ce.body)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tu.ce.cards.map((card) => (
                <div key={card.href} className="card bg-white p-8">
                  <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                    {t(tu.ce.openEnrollment)}
                  </div>
                  <h3 className="mt-3 font-display text-2xl text-navy leading-tight">
                    {t(card.title)}
                  </h3>
                  <div className="mt-4 font-display text-4xl text-teal">
                    {card.price}
                  </div>
                  <div className="mt-1 text-sm text-muted">{t(card.detail)}</div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <a
                      href={APPLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      {t(tu.ce.enroll)} <span aria-hidden="true">→</span>
                    </a>
                    <Link href={card.href} className="btn-ghost">
                      {t(tu.ce.courseDetails)}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAREER OUTLOOK (cited) */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl mb-10">
            <div className="eyebrow">{t(tu.outlook.eyebrow)}</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
              {t(tu.outlook.heading)}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tu.outlook.stats.map((s, i) => (
              <div key={i} className="card bg-white p-6">
                <div className="font-display text-4xl text-teal">{t(s.stat)}</div>
                <div className="mt-2 text-sm text-navy leading-relaxed">
                  {t(s.label)}
                </div>
                <div className="mt-3 text-[11px] text-subtle">
                  {t(s.source)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy text-white">
          <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20 text-center">
            <h2 className="font-display text-3xl md:text-4xl leading-tight">
              {t(tu.cta.heading)}
            </h2>
            <p className="mt-4 text-navy-100 text-lg max-w-xl mx-auto">
              {t(tu.cta.body)}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/atticus" className="btn-primary">
                {t(tu.cta.primary)} <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/tour"
                className="text-teal-soft hover:text-teal underline underline-offset-4 text-sm"
              >
                {t(tu.cta.secondary)}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
