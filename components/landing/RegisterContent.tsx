"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { ApplicationModal } from "@/components/landing/ApplicationModal";
import { VideoModal } from "@/components/landing/VideoModal";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { register as r } from "@/lib/i18n/register";
import { COHORTS } from "@/lib/cohort";
import {
  CALENDLY_TOUR_URL,
  QBO_REGISTRATION_URL,
  REGISTRATION_FEE,
  VIRTUAL_TOUR_YOUTUBE_ID,
} from "@/lib/payment";

/**
 * /register body — Entry Level Dental Assisting enrollment hub, framed as
 * "Easy as 1-2-3".
 *
 *   Step 1  Free campus tour (Calendly). Visibly free — tinted card, teal
 *           border, FREE badge — so it never reads as a paid step.
 *   Step 2  $150 registration fee. QuickBooks Buy Button, opens in its own
 *           tab because Intuit refuses to be framed; the card then shows a
 *           handoff panel with "I've paid — continue".
 *   Step 3  Application + enrollment agreement in an on-page modal. FIDA's
 *           own flow, so it can be embedded — the visitor stays here.
 *
 * Then "what happens next" as the confirmation content.
 */
export function RegisterContent() {
  const { t } = useLang();

  /* qboOpened: the visitor has clicked through to QuickBooks, so step 2 swaps
     to the "finish in that tab" panel. feePaid: they came back and said so —
     we can't verify it from here (QuickBooks doesn't call us back), staff
     reconcile against QBO by name and email, exactly as they do today. */
  const [qboOpened, setQboOpened] = useState(false);
  const [feePaid, setFeePaid] = useState(false);
  const [appOpen, setAppOpen] = useState(false);
  const [tour, setTour] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <ApplicationModal open={appOpen} onClose={() => setAppOpen(false)} feePaid={feePaid} />
      <VideoModal
        open={tour}
        onClose={() => setTour(false)}
        youtubeId={VIRTUAL_TOUR_YOUTUBE_ID}
        title={t(r.step0VideoTitle)}
        closeLabel={t(r.step0VideoClose)}
      />
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

        {/* EASY AS 1-2-3 */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
          <div className="max-w-2xl mb-8 md:mb-10">
            <h2 className="font-display text-3xl md:text-4xl text-navy tracking-tight">
              {t(r.easyHeading)}
            </h2>
            <p className="mt-3 text-muted leading-relaxed">{t(r.easySub)}</p>
          </div>

          {/*
            items-stretch + each card a flex column with an mt-auto footer keeps
            the three CTAs on one line regardless of how much body copy each
            card carries. The old layout let the longest button label push its
            card's CTA out of line with the other two.
          */}
          <ol className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Step 1 — Campus tour (Calendly). Free, and visibly so: tinted
                card, teal border, FREE badge. Nothing is owed at this step and
                the page should never let that be ambiguous. */}
            <li className="card bg-teal/[0.04] border-2 border-teal/50 p-8 md:p-10 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                  {t(r.step0Label)}
                </div>
                <span className="rounded-full bg-teal px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-white">
                  {t(r.freeBadge)}
                </span>
              </div>
              <h3 className="mt-3 font-display text-2xl md:text-3xl text-navy leading-tight whitespace-pre-line">
                {t(r.step0Title)}
              </h3>
              <p className="mt-4 text-muted leading-relaxed flex-1">{t(r.step0Body)}</p>
              <div className="mt-6">
                <a
                  href={CALENDLY_TOUR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  {t(r.step0Cta)} <span aria-hidden="true">↗</span>
                </a>

                {/* Second door on the free step. Booking a time is a
                    commitment; watching the walkthrough isn't, and someone not
                    ready for the first will often take the second. Outlined,
                    not solid, so it doesn't compete with "Book my tour" — and
                    it opens in a modal rather than handing the visitor to
                    youtube.com, where the next thing on screen is somebody
                    else's video. */}
                <button
                  type="button"
                  onClick={() => setTour(true)}
                  className="mt-2 w-full justify-center rounded-md border border-teal/40 px-4 py-2.5 text-sm font-semibold text-teal transition hover:bg-teal/[0.08] focus:outline-none focus:ring-2 focus:ring-teal/50"
                >
                  <span aria-hidden="true">▶</span> {t(r.step0VideoCta)}
                </button>

                <p className="mt-3 text-sm text-subtle min-h-[2.75rem]">{t(r.step0Done)}</p>
              </div>
            </li>

            {/* Step 2 — $150 registration fee, paid through QuickBooks.
                Intuit sends x-frame-options SAMEORIGIN and frame-ancestors
                'self' https://*.intuit.com, so their pay page CANNOT be put in
                a modal on this domain — an iframe renders an empty box. It
                opens in its own tab, and the panel below keeps the visitor
                oriented here while that happens. */}
            <li className="card bg-white p-8 md:p-10 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                  {t(r.step2Label)}
                </div>
                <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-navy">
                  {t(r.paidBadge)}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <div className="font-display text-4xl text-navy">{REGISTRATION_FEE}</div>
              </div>
              <h3 className="mt-2 font-display text-2xl md:text-3xl text-navy leading-tight">
                {t(r.step2Title)}
              </h3>
              <p className="mt-4 text-muted leading-relaxed flex-1">{t(r.step2Body)}</p>

              <div className="mt-6">
                {!qboOpened ? (
                  <>
                    <a
                      href={QBO_REGISTRATION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setQboOpened(true)}
                      className="btn-primary w-full justify-center"
                    >
                      {t(r.step2Cta)} <span aria-hidden="true">↗</span>
                    </a>
                    <p className="mt-3 text-sm text-subtle min-h-[2.75rem]">{t(r.step2Note)}</p>
                  </>
                ) : (
                  <div className="rounded-md border border-teal/40 bg-teal/[0.06] p-4">
                    <div className="font-semibold text-navy text-sm">{t(r.qboOpenedTitle)}</div>
                    <p className="mt-1.5 text-sm text-muted leading-relaxed">{t(r.qboOpenedBody)}</p>
                    {/* Goes straight into step 3 rather than just flipping a
                        flag. That way the payment claim reaches Ashley
                        attached to a name and email, instead of as an
                        anonymous "someone says they paid" ping. */}
                    <button
                      type="button"
                      onClick={() => {
                        setFeePaid(true);
                        setAppOpen(true);
                      }}
                      className="btn-primary mt-4 w-full justify-center"
                    >
                      {t(r.qboPaidCta)} <span aria-hidden="true">→</span>
                    </button>
                    <a
                      href={QBO_REGISTRATION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center text-sm font-semibold text-teal hover:underline"
                    >
                      {t(r.qboReopen)} <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                )}
              </div>
            </li>

            {/* Step 3 — Application + enrollment agreement, in an on-page
                modal. This is FIDA's own flow, so unlike QuickBooks it can be
                embedded and the visitor never leaves /register. */}
            <li className="card bg-white p-8 md:p-10 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal">
                  {t(r.step1Label)}
                </div>
                <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-navy">
                  {t(r.paidBadge)}
                </span>
              </div>
              <h3 className="mt-3 font-display text-2xl md:text-3xl text-navy leading-tight">
                {t(r.step1Title)}
              </h3>
              <p className="mt-4 text-muted leading-relaxed flex-1">{t(r.step1Body)}</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setAppOpen(true)}
                  className="btn-primary w-full justify-center"
                >
                  {t(r.step1Cta)} <span aria-hidden="true">→</span>
                </button>
                <p className="mt-3 text-sm text-subtle min-h-[2.75rem]">
                  {feePaid ? t(r.qboPaidNote) : t(r.step1Done)}
                </p>
              </div>
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
            {/* Scannable, not readable: a numbered chip, a short title, then
                bullets. The step number sits in a filled circle so the eye can
                follow 1-2-3-4 across without reading a word. */}
            <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {r.next.map((s, i) => (
                <li key={s.title.en} className="card bg-white p-6 flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="font-display text-lg text-navy leading-tight">
                      {t(s.title)}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {s.bullets.map((bl) => (
                      <li key={bl.en} className="flex items-start gap-2.5 text-sm text-navy">
                        <span className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal" />
                        <span>{t(bl)}</span>
                      </li>
                    ))}
                  </ul>
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
