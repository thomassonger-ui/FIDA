"use client";

import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { RotatingHeadline } from "@/components/landing/RotatingHeadline";
import { AtticusChat } from "@/components/admissions/AtticusChat";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { COHORTS } from "@/lib/cohort";
import { home, credentials } from "@/lib/i18n/home";
import { atticus as atticusCopy } from "@/lib/i18n/atticus";

/**
 * Homepage body. Split out of app/page.tsx as a client component so the page
 * can stay a server component and keep exporting `metadata` + the JSON-LD
 * organization block untouched.
 */
export function HomeContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">

      {/* HERO */}
      <section className="relative overflow-hidden bg-navy">
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-hero-fade" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-24 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/15 border border-teal/30 text-teal-soft text-xs font-semibold tracking-[0.14em] uppercase backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              {t(home.hero.badge)}
            </div>

            <RotatingHeadline />

            <p className="mt-6 text-navy-100 text-lg md:text-xl leading-relaxed max-w-xl">
              {t(home.hero.subhead)}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link href="/programs" className="btn-primary">
                {t(home.hero.ctaPrimary)} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/portal/login" className="btn-secondary">
                {t(home.hero.ctaSecondary)}
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-navy-200">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal" />
                {t(home.hero.trust1)}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-teal" />
                {t(home.hero.trust2)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CREDENTIALS — institutional standing, stated once, beneath the hero.
          Editorial strip: small-caps label over a serif line, hairline dividers,
          no badges or seals. */}
      <section
        aria-label="Institutional credentials"
        className="bg-white border-b border-rule"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
          <dl className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-rule">
            {credentials.items.map((c) => (
              <div
                key={c.label.en}
                className="py-7 md:py-9 md:px-8 first:md:pl-0 last:md:pr-0"
              >
                <dt className="text-[11px] font-semibold tracking-[0.16em] uppercase text-teal">
                  {t(c.label)}
                </dt>
                <dd className="mt-2 font-display text-xl md:text-[1.35rem] text-navy leading-snug">
                  {t(c.body)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
          {home.pillars.map((p) => (
            <div key={p.label.en} className="flex items-start gap-4">
              <div className="font-display text-5xl text-teal leading-none">
                {t(p.stat)}
              </div>
              <div>
                <div className="text-navy font-semibold text-sm">{t(p.label)}</div>
                <div className="text-muted text-sm mt-0.5">{t(p.note)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIENCE-PICKER BAND — two enrollment paths + student portal */}
      <section className="bg-white border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/programs/entry-level-dental-assisting"
              className="card card-hover block p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 font-display text-teal text-lg">
                  01
                </span>
                <div className="eyebrow">{t(home.audience.card1.eyebrow)}</div>
              </div>
              <div className="font-display text-xl text-navy mb-1">
                {t(home.audience.card1.title)}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {t(home.audience.card1.body)}
              </p>
              <div className="mt-4 text-sm font-semibold text-teal">
                {t(home.audience.card1.cta)} <span aria-hidden="true">&rarr;</span>
              </div>
            </Link>

            <Link
              href="/programs#professional-development"
              className="card card-hover block p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 font-display text-teal text-lg">
                  02
                </span>
                <div className="eyebrow">{t(home.audience.card2.eyebrow)}</div>
              </div>
              <div className="font-display text-xl text-navy mb-1">
                {t(home.audience.card2.title)}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {t(home.audience.card2.body)}
              </p>
              <div className="mt-4 text-sm font-semibold text-teal">
                {t(home.audience.card2.cta)} <span aria-hidden="true">&rarr;</span>
              </div>
            </Link>

            <Link href="/portal/login" className="card card-hover block p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 font-display text-teal text-lg">
                  03
                </span>
                <div className="eyebrow">{t(home.audience.card3.eyebrow)}</div>
              </div>
              <div className="font-display text-xl text-navy mb-1">
                {t(home.audience.card3.title)}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {t(home.audience.card3.body)}
              </p>
              <div className="mt-4 text-sm font-semibold text-teal">
                {t(home.audience.card3.cta)} <span aria-hidden="true">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ATTICUS ADMISSIONS INTAKE — live chat, not a link-out. Restored to
          the homepage 2026-08-09 at Tom's request; the June aed9007 removal
          took it off the public site. */}
      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-2">
              <div className="eyebrow">{t(atticusCopy.sectionEyebrow)}</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-tight">
                {t(atticusCopy.sectionHeadingLead)}
                <span className="text-teal">
                  {t(atticusCopy.sectionHeadingAccent)}
                </span>
              </h2>
              <p className="mt-5 text-muted text-lg leading-relaxed">
                {t(atticusCopy.sectionBody)}
              </p>

              <div className="mt-8 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/atticus-logo.png"
                  alt=""
                  aria-hidden="true"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="font-display text-xl text-navy leading-tight">
                    Atticus
                  </div>
                  <div className="text-[11px] font-semibold tracking-[0.14em] uppercase text-teal">
                    {t(atticusCopy.logoRole)}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <AtticusChat />
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <div className="eyebrow">{t(home.programsSection.eyebrow)}</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight">
              {t(home.programsSection.headingLead)}
              <em className="text-teal not-italic">
                {t(home.programsSection.headingAccent)}
              </em>
            </h2>
          </div>
          <Link href="/programs" className="btn-ghost">
            {t(home.programsSection.seeAll)} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {home.programsSection.cards.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="card card-hover p-8 flex flex-col group"
            >
              <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.1em] uppercase text-teal">
                <span>{t(p.length)}</span>
                <span className="w-1 h-1 rounded-full bg-rule" />
                <span>{t(p.outcome)}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl text-navy leading-tight">
                {t(p.title)}
              </h3>
              <p className="mt-3 text-muted leading-relaxed text-sm">
                {t(p.blurb)}
              </p>
              <div className="mt-6 pt-6 border-t border-rule flex items-center justify-between text-sm font-semibold text-navy group-hover:text-teal transition-colors">
                {t("isCourse" in p && p.isCourse ? home.programsSection.courseDetails : home.programsSection.details)}
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-white border-b border-rule">
        <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="eyebrow text-center">{t(home.testimonial.eyebrow)}</div>
          <figure className="mt-6 text-center">
            <blockquote className="font-display text-2xl md:text-3xl text-navy leading-snug">
              “{t(home.testimonial.quote)}”
            </blockquote>
            <figcaption className="mt-6 text-sm font-semibold text-navy">
              — {home.testimonial.name},{" "}
              <a
                href={home.testimonial.orgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline underline-offset-4"
              >
                {home.testimonial.org}
              </a>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* WHY FIDA */}
      <section className="bg-paper-subtle">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="eyebrow">{t(home.why.eyebrow)}</div>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight">
                {t(home.why.heading)}
              </h2>
              <div className="mt-8 space-y-5">
                {home.why.items.map((item) => (
                  <div key={item.title.en} className="flex gap-4">
                    <div className="mt-1.5 w-5 h-5 rounded-full bg-teal/15 border border-teal/40 flex items-center justify-center flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{t(item.title)}</div>
                      <p className="mt-1 text-muted text-sm leading-relaxed">
                        {t(item.body)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Image
                src="/photos/dental-assisting-classroom-training-jacksonville.jpg"
                alt="FIDA instructor working chairside while four dental assisting students observe during hands-on training in Jacksonville"
                width={1440}
                height={1800}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="mt-10 rounded-lg shadow-card w-full h-auto"
              />
            </div>

            <div className="card p-8 md:p-10 bg-white shadow-card">
              <div className="eyebrow">{t(home.cohort.eyebrow)}</div>
              <div className="mt-2 font-display text-4xl text-navy">
                {t(home.cohort.date)}
              </div>
              <div className="mt-1 text-sm text-muted">{t(COHORTS[0].schedule)}</div>
              {COHORTS.length > 1 && (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {COHORTS.slice(1).map((c) => (
                    <li key={c.date.en} className="text-navy">
                      <span className="font-semibold">{t(c.date)}</span>
                      <span className="text-muted"> · {t(c.schedule)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-muted text-sm leading-relaxed">
                {t(home.cohort.note)}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="border border-rule rounded-md p-4">
                  <div className="text-xs font-semibold tracking-[0.1em] uppercase text-teal">
                    {t(home.cohort.priorityLabel)}
                  </div>
                  <div className="mt-1 font-display text-lg text-navy">
                    {t(home.cohort.priorityValue)}
                  </div>
                </div>
                <div className="border border-rule rounded-md p-4">
                  <div className="text-xs font-semibold tracking-[0.1em] uppercase text-teal">
                    {t(home.cohort.seatsLabel)}
                  </div>
                  <div className="mt-1 font-display text-lg text-navy">
                    {t(home.cohort.seatsValue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALREADY A STUDENT BAND — quick portal/support paths */}
      <section className="bg-paper-subtle border-t border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl mb-10">
            <div className="eyebrow">{t(home.student.eyebrow)}</div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
              {t(home.student.heading)}
            </h2>
            <p className="mt-4 text-muted text-lg leading-relaxed">
              {t(home.student.body)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/portal/login" className="card card-hover block p-6">
              <div className="eyebrow mb-2">{t(home.student.portalEyebrow)}</div>
              <div className="font-display text-xl text-navy mb-1">
                {t(home.student.portalTitle)}
              </div>
              <div className="text-sm text-muted">{t(home.student.portalBody)}</div>
            </Link>
            <Link href="/tickets" className="card card-hover block p-6">
              <div className="eyebrow mb-2">{t(home.student.supportEyebrow)}</div>
              <div className="font-display text-xl text-navy mb-1">
                {t(home.student.supportTitle)}
              </div>
              <div className="text-sm text-muted">{t(home.student.supportBody)}</div>
            </Link>
          </div>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}
