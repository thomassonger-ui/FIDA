"use client";

import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { register as r } from "@/lib/i18n/register";
import { COHORTS } from "@/lib/cohort";
import { QBO_REGISTRATION_URL, REGISTRATION_FEE } from "@/lib/payment";

/**
 * /register body — Entry Level Dental Assisting enrollment hub.
 * Step 1: Atticus application. Step 2: $150 registration fee (QuickBooks
 * Buy Button, new tab). Then "what happens next" as the confirmation content.
 */
export function RegisterContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HEADER */}
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(r.eyebrow)}</div>
              <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(r.h1)}
              </h1>
              <p className="mt-5 text-muted text-lg leading-relaxed">{t(r.lede)}</p>
            </div>
          </div>
        </section>

        {/* TWO STEPS */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
          <ol className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1 — Atticus */}
            <li className="card bg-white p-8 md:p-10 flex flex-col">
              <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                {t(r.step1Label)}
              </div>
              <h2 className="mt-3 font-display text-2xl md:text-3xl text-navy leading-tight">
                {t(r.step1Title)}
              </h2>
              <p className="mt-4 text-muted leading-relaxed flex-1">{t(r.step1Body)}</p>
              <div className="mt-6">
                <Link href="/atticus" className="btn-ghost">
                  {t(r.step1Cta)} <span aria-hidden="true">→</span>
                </Link>
              </div>
              <p className="mt-3 text-sm text-subtle">{t(r.step1Done)}</p>
            </li>

            {/* Step 2 — QBO payment */}
            <li className="card bg-white p-8 md:p-10 flex flex-col border-teal/40">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                  {t(r.step2Label)}
                </div>
                <div className="font-display text-4xl text-navy">{REGISTRATION_FEE}</div>
              </div>
              <h2 className="mt-3 font-display text-2xl md:text-3xl text-navy leading-tight">
                {t(r.step2Title)}
              </h2>
              <p className="mt-4 text-muted leading-relaxed flex-1">{t(r.step2Body)}</p>
              <div className="mt-6">
                {/* QuickBooks Online Buy Button — link supplied by Ashley 2026-08-25. */}
                <a
                  href={QBO_REGISTRATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full sm:w-auto"
                >
                  {t(r.step2Cta)} <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className="mt-3 text-sm text-subtle">{t(r.step2Note)}</p>
            </li>
          </ol>
        </section>

        {/* WHAT HAPPENS NEXT */}
        <section className="bg-paper-subtle border-y border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(r.nextEyebrow)}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                {t(r.nextHeading)}
              </h2>
            </div>
            <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {r.next.map((s, i) => (
                <li key={s.title.en} className="card bg-white p-6">
                  <div className="font-mono text-xs text-teal">0{i + 1}</div>
                  <div className="mt-2 font-display text-lg text-navy leading-tight">
                    {t(s.title)}
                  </div>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{t(s.body)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CLASSES + LINKS */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="eyebrow">{t(r.classesEyebrow)}</div>
              <ul className="mt-4 space-y-3">
                {COHORTS.map((c) => (
                  <li key={c.date.en} className="card bg-white p-4">
                    <div className="font-display text-lg text-navy">{t(c.date)}</div>
                    <div className="text-sm text-muted">
                      {t(c.label)} · {t(c.schedule)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 lg:pt-8">
              <Link href="/tuition#payment" className="btn-ghost">
                {t(r.tuitionLink)} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/atticus" className="btn-ghost">
                {t(r.questionsLink)} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
