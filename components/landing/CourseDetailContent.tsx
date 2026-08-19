"use client";

import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { APPLY_URL, type CourseDetail } from "@/lib/i18n/courseDetail";

/**
 * Shared body for the two SEO course-detail pages. Both routes stay server
 * components so they keep their own metadata + Course/FAQPage JSON-LD.
 */
export function CourseDetailContent({ d }: { d: CourseDetail }) {
  const { t } = useLang();

  // Apply CTA: Moodle (external, new tab) by default; the diploma page
  // overrides to the Atticus intake (internal, same tab).
  const applyHref = d.applyHref ?? APPLY_URL;
  const applyInternal = applyHref.startsWith("/");

  const ApplyCta = ({ className }: { className: string }) =>
    applyInternal ? (
      <Link href={applyHref} className={className}>
        {t(d.applyNow)} <span aria-hidden="true">→</span>
      </Link>
    ) : (
      <a
        href={applyHref}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {t(d.applyNow)} <span aria-hidden="true">→</span>
      </a>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(d.eyebrow)}</div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(d.h1)}
              </h1>
              <p className="mt-6 text-muted text-lg leading-relaxed">{t(d.intro)}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <ApplyCta className="btn-primary" />
                <Link href="/tickets" className="btn-ghost">
                  {t(d.getStarted)}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FACTS */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {d.facts.map((f) => (
              <div key={f.label.en} className="card bg-white p-6">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                  {t(f.label)}
                </div>
                <div className="mt-2 text-navy">{t(f.value)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIAL (optional) */}
        {d.testimonial && (
          <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pb-14 md:pb-16">
            <figure className="card bg-white p-8 md:p-10 max-w-3xl">
              <blockquote className="font-display text-xl md:text-2xl text-navy leading-snug">
                “{t(d.testimonial.quote)}”
              </blockquote>
              <figcaption className="mt-4 text-sm text-navy font-semibold">
                — {t(d.testimonial.name)}
                {d.testimonial.org && (
                  <>
                    ,{" "}
                    {d.testimonial.orgUrl ? (
                      <a
                        href={d.testimonial.orgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal hover:underline underline-offset-4"
                      >
                        {d.testimonial.org}
                      </a>
                    ) : (
                      d.testimonial.org
                    )}
                  </>
                )}
              </figcaption>
            </figure>
          </section>
        )}

        {/* REQUIREMENTS */}
        <section className="bg-paper-subtle border-y border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(d.requirementsEyebrow)}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                {t(d.requirementsHeading)}
              </h2>
              <ul className="mt-8 space-y-4">
                {d.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-navy">
                    <span className="mt-1.5 w-5 h-5 rounded-full bg-teal/15 border border-teal/40 flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    </span>
                    <span className="leading-relaxed">{t(r)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CURRICULUM */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl mb-8">
            <div className="eyebrow">{t(d.curriculumEyebrow)}</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
              {t(d.curriculumHeading)}
            </h2>
            <p className="mt-4 text-muted leading-relaxed">{t(d.curriculumBody)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {d.courses.map((c) => (
              <div key={c.code} className="card bg-white p-4 flex items-center gap-3">
                <span className="font-mono text-xs text-teal">{c.code}</span>
                <span className="text-sm text-navy">{t(c.title)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* COST */}
        <section className="bg-paper-subtle border-y border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="eyebrow">{t(d.costEyebrow)}</div>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                  {t(d.costHeading)}
                </h2>
                <p className="mt-4 text-muted leading-relaxed">{t(d.costBody)}</p>
              </div>
              <div className="card bg-white p-8">
                <div className="font-display text-5xl text-teal">
                  {d.priceDisplay}
                </div>
                <div className="mt-1 text-sm text-muted">{t(d.priceNote)}</div>
                <ApplyCta className="btn-primary w-full mt-6" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="eyebrow">{t(d.faqEyebrow)}</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
            {t(d.faqHeading)}
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {d.faqs.map((f) => (
              <div key={f.q.en} className="card bg-white p-6">
                <h3 className="font-display text-lg text-navy leading-tight">
                  {t(f.q)}
                </h3>
                <p className="mt-3 text-muted text-sm leading-relaxed">{t(f.a)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy text-white">
          <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20 text-center">
            <h2 className="font-display text-3xl md:text-4xl leading-tight">
              {t(d.ctaHeading)}
            </h2>
            <p className="mt-4 text-navy-100 text-lg max-w-xl mx-auto">
              {t(d.ctaBody)}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ApplyCta className="btn-primary" />
              <Link
                href="/programs"
                className="text-teal-soft hover:text-teal underline underline-offset-4 text-sm"
              >
                {t(d.ctaSeeAll)}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
