"use client";

import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang, type Bilingual } from "@/lib/i18n/LanguageProvider";
import { programs, programsCopy as c } from "@/lib/i18n/programs";
import { entryLevelDetail as d } from "@/lib/i18n/entryLevelDetail";
import { COHORTS } from "@/lib/cohort";

/**
 * /programs body. Client component so the route can stay a server component
 * and keep exporting `metadata` + the Course JSON-LD.
 */
export function ProgramsContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HEADER */}
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(c.eyebrow)}</div>
              <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(c.heading)}
              </h1>
              <p className="mt-6 text-muted text-lg leading-relaxed">
                {t(c.subtitle)}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/admissions" className="btn-primary">
                  {t(c.ctaAdmissions)} <span aria-hidden="true">→</span>
                </Link>
                <a href="#compare" className="btn-ghost">
                  {t(c.ctaCompare)}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* DIPLOMA PROGRAM — Entry Level Dental Assisting */}
        <section
          id="diploma"
          className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pt-16 scroll-mt-24"
        >
          <div className="card bg-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-10">
                <div className="eyebrow">{t(c.diploma.eyebrow)}</div>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                  {t(c.diploma.title)}
                </h2>
                <p className="mt-2 text-teal font-semibold">{t(c.diploma.tagline)}</p>

                <p className="mt-6 text-navy leading-relaxed">{t(d.intro)}</p>

                <div className="mt-6 font-display text-5xl text-teal">
                  {c.diploma.price}
                </div>
                <div className="mt-1 text-sm text-muted">
                  {t(c.diploma.priceBreakdown)}
                </div>

                <div className="mt-4 text-sm text-navy">
                  <div className="font-semibold">{t(c.diploma.nextCohortLabel)}</div>
                  <ul className="mt-1.5 space-y-1">
                    {COHORTS.map((co) => (
                      <li key={co.date.en}>
                        <span className="font-semibold">{t(co.date)}</span>
                        <span className="text-muted"> · {t(co.schedule)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link href={d.applyHref ?? "/atticus"} className="btn-primary">
                    {t(c.diploma.apply)} <span aria-hidden="true">→</span>
                  </Link>
                  <Link
                    href="/programs/entry-level-dental-assisting"
                    className="btn-ghost"
                  >
                    {t(c.diploma.details)}
                  </Link>
                </div>
              </div>

              <div className="p-8 md:p-10 bg-paper-subtle border-t lg:border-t-0 lg:border-l border-rule">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                  {t(c.diploma.factsHeading)}
                </div>
                <dl className="mt-5 space-y-4 text-sm">
                  {d.facts
                    .filter(
                      (f) =>
                        f.label.en !== "Next cohort" && f.label.en !== "Class schedule",
                    )
                    .map((f) => (
                    <div key={f.label.en} className="flex flex-col gap-0.5">
                      <dt className="text-navy/70 font-semibold tracking-wide uppercase text-xs">
                        {t(f.label)}
                      </dt>
                      <dd className="text-navy leading-relaxed">{t(f.value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE — CE courses */}
        <section
          id="compare"
          className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 scroll-mt-24"
        >
          <div className="max-w-3xl mb-8">
            <div className="eyebrow">{t(c.ce.eyebrow)}</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
              {t(c.compareHeading)}
            </h2>
            <p className="mt-4 text-muted leading-relaxed">{t(c.compareBody)}</p>
          </div>
          <div className="card bg-white overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 border-b border-rule bg-paper-subtle">
              {[c.table.course, c.table.length, c.table.credential, c.table.tuition].map(
                (h, i) => (
                  <div
                    key={h.en}
                    className={`p-5 md:p-6 text-xs font-semibold tracking-[0.12em] uppercase text-navy/70 ${
                      i > 0 ? "border-l border-rule" : ""
                    }`}
                  >
                    {t(h)}
                  </div>
                ),
              )}
            </div>
            {programs.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-1 md:grid-cols-4 ${
                  i !== programs.length - 1 ? "border-b border-rule" : ""
                }`}
              >
                <div className="p-5 md:p-6">
                  <a
                    href={`#${p.id}`}
                    className="font-display text-xl text-navy hover:text-teal transition-colors"
                  >
                    {t(p.title)}
                  </a>
                </div>
                <div className="p-5 md:p-6 text-navy md:border-l border-rule">
                  {t(p.length)}
                </div>
                <div className="p-5 md:p-6 text-navy md:border-l border-rule">
                  {t(p.credential)}
                </div>
                <div className="p-5 md:p-6 text-navy font-semibold md:border-l border-rule">
                  {p.tuition}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-subtle">{t(c.table.note)}</div>
        </section>

        {/* PROGRAM DEEP DIVES */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pb-20 space-y-16">
          {programs.map((p, idx) => (
            <article key={p.id} id={p.id} className="scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Left: meta */}
                <div className="lg:col-span-1">
                  <div className="eyebrow">
                    {t(c.detail.courseLabel)} 0{idx + 1}
                  </div>
                  <h2 className="mt-4 font-display text-3xl md:text-4xl text-navy leading-tight">
                    {t(p.title)}
                  </h2>
                  <p className="mt-2 text-teal font-semibold">{t(p.tagline)}</p>

                  <dl className="mt-6 space-y-4 text-sm">
                    <MetaRow label={t(c.detail.length)} value={t(p.length)} />
                    <MetaRow label={t(c.detail.format)} value={t(p.format)} />
                    <MetaRow label={t(c.detail.credential)} value={t(p.credential)} />
                    <MetaRow label={t(c.detail.tuition)} value={p.tuition} emphasis />
                    <MetaRow label={t(c.detail.textbook)} value={t(p.textbook)} />
                  </dl>

                  <a
                    href="https://fldentalassisting.moodlecloud.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-8 w-full"
                  >
                    {t(c.detail.apply)} <span aria-hidden="true">→</span>
                  </a>

                  <Link
                    href={
                      p.id === "efda"
                        ? "/programs/efda-certification-florida"
                        : "/programs/dental-radiography-certification"
                    }
                    className="block mt-3 text-center text-sm font-semibold text-teal hover:underline"
                  >
                    {t(c.detail.fullRequirements)}{" "}
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>

                {/* Right: content */}
                <div className="lg:col-span-2 card bg-white p-8 md:p-10">
                  <p className="text-navy text-lg leading-relaxed">{t(p.summary)}</p>

                  <div className="mt-8">
                    <div className="eyebrow">{t(c.detail.beforeEnroll)}</div>
                    <ul className="mt-4 space-y-2.5">
                      {p.prerequisites.map((pre, i) => (
                        <li key={i} className="flex items-start gap-3 text-navy">
                          <span className="mt-1 w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700 text-[10px] font-bold">
                            !
                          </span>
                          <span className="text-sm leading-relaxed">{t(pre)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <div className="eyebrow">{t(c.detail.breakdown)}</div>
                    <div className="mt-4 border border-rule rounded-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-paper-subtle">
                          <tr className="text-left text-xs uppercase tracking-wider text-muted">
                            <th className="px-4 py-2.5 font-semibold">
                              {t(c.detail.courseNum)}
                            </th>
                            <th className="px-4 py-2.5 font-semibold">
                              {t(c.detail.title)}
                            </th>
                            <th className="px-4 py-2.5 font-semibold text-right">
                              {t(c.detail.hours)}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.courses.map((course, i) => (
                            <tr
                              key={course.code}
                              className={i !== 0 ? "border-t border-rule" : ""}
                            >
                              <td className="px-4 py-2.5 font-mono text-xs text-navy">
                                {course.code}
                              </td>
                              <td className="px-4 py-2.5 text-navy">
                                {t(course.title)}
                              </td>
                              <td className="px-4 py-2.5 text-navy text-right tabular-nums">
                                {course.hours}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-rule bg-paper-subtle/60">
                            <td
                              className="px-4 py-2.5 font-semibold text-navy"
                              colSpan={2}
                            >
                              {t(c.detail.total)}
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-navy text-right tabular-nums">
                              {p.courses.reduce((sum, x) => sum + x.hours, 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* PROFESSIONAL DEVELOPMENT / CE SECTION */}
        <section className="bg-paper-subtle border-t border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
            <div className="max-w-3xl mb-10">
              <div className="eyebrow">{t(c.ce.eyebrow)}</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight">
                {t(c.ce.heading)}
              </h2>
              <p className="mt-5 text-muted text-lg leading-relaxed">
                {t(c.ce.body)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {c.ce.cards.map((card) => (
                <div key={card.title.en} className="card bg-white p-5">
                  <div className="font-display text-lg text-navy mb-1.5">
                    {t(card.title)}
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{t(card.body)}</p>
                </div>
              ))}
            </div>

            <div className="card bg-white p-6 md:p-8 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-display text-xl text-navy mb-1">
                  {t(c.ce.scheduleTitle)}
                </div>
                <p className="text-sm text-muted max-w-md">{t(c.ce.scheduleBody)}</p>
              </div>
              <Link href="/tickets" className="btn-primary">
                {t(c.ce.scheduleCta)}
              </Link>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="bg-navy text-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-20 text-center">
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft">
              {t(c.cta.eyebrow)}
            </div>
            <h2 className="mt-4 font-display text-4xl md:text-5xl leading-tight">
              {t(c.cta.heading)}
            </h2>
            <p className="mt-5 text-navy-100 text-lg max-w-2xl mx-auto">
              {t(c.cta.body)}
            </p>
            <div className="mt-10">
              <Link href="/admissions" className="btn-primary">
                {t(c.cta.button)} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function MetaRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-24 text-navy/70 font-semibold tracking-wide uppercase text-xs pt-0.5 flex-shrink-0">
        {label}
      </dt>
      <dd className={emphasis ? "text-navy font-semibold" : "text-navy"}>
        {value}
      </dd>
    </div>
  );
}

export type { Bilingual };
