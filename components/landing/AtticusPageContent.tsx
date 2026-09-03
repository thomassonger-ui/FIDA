"use client";

import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { AtticusChat } from "@/components/admissions/AtticusChat";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { atticus as A } from "@/lib/i18n/atticus";

import { CALENDLY_TOUR_URL } from "@/lib/payment";

const CALENDLY_BASE = CALENDLY_TOUR_URL;

/**
 * /atticus — the registration-intake page. The live chat is the primary path;
 * the Calendly booking is the human fallback. `src` comes from the ?src= QR /
 * campaign param and is logged server-side for attribution.
 */
export function AtticusPageContent({ src }: { src: string | null }) {
  const { t } = useLang();
  const p = A.page;

  const calendlyUrl = src
    ? `${CALENDLY_BASE}?utm_source=${encodeURIComponent(src)}&utm_campaign=atticusm`
    : `${CALENDLY_BASE}?utm_campaign=atticusm`;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HEADER */}
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(p.eyebrow)}</div>
              <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(p.h1)}
              </h1>
              <p className="mt-5 text-muted text-lg leading-relaxed">
                {t(p.lede)}
              </p>
            </div>
          </div>
        </section>

        {/* INTAKE */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-2">
              <div className="eyebrow">{t(p.startEyebrow)}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight leading-tight">
                {t(p.startHeading)}
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-3">
                {p.tiles.map((tile) => (
                  <div key={tile.title.en} className="card bg-white p-4">
                    <div className="font-display text-lg text-navy">
                      {t(tile.title)}
                    </div>
                    <p className="text-sm text-muted mt-1 leading-relaxed">
                      {t(tile.body)}
                    </p>
                  </div>
                ))}
              </div>

              {/* ENROLLMENT PATH — tour → $150 → application → deposit. */}
              <div className="mt-6 card bg-navy text-white p-5">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-teal-soft">
                  {t(p.nextStepEyebrow)}
                </div>
                <div className="mt-2 font-display text-lg leading-tight">
                  {t(p.nextStepHeading)}
                </div>
                <p className="mt-2 text-sm text-white/80 leading-relaxed">
                  {t(p.nextStepBody)}
                </p>
                <Link href="/register" className="btn-primary mt-4 inline-flex">
                  {t(p.nextStepCta)} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-3">
              <AtticusChat />
            </div>
          </div>
        </section>

        {/* HUMAN FALLBACK */}
        <section className="bg-paper-subtle border-y border-rule">
          <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
            <div className="flex items-center gap-3 text-xs text-subtle uppercase tracking-[0.14em] mb-6">
              <span aria-hidden="true" className="flex-1 h-px bg-rule" />
              <span>{t(p.orDivider)}</span>
              <span aria-hidden="true" className="flex-1 h-px bg-rule" />
            </div>

            <div className="card bg-white p-6 md:p-8 flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <div className="eyebrow">{t(p.calendlyEyebrow)}</div>
                <p className="font-display text-xl text-navy mt-2 leading-snug">
                  {t(p.calendlyHeading)}
                </p>
                <p className="text-sm text-muted mt-2 max-w-lg leading-relaxed">
                  {t(p.calendlyBody)}
                </p>
              </div>
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary whitespace-nowrap"
              >
                {t(p.calendlyCta)} <span aria-hidden="true">→</span>
              </a>
            </div>

            {src && (
              <p className="text-[11px] text-subtle mt-8 italic">
                {t(p.referredFrom)}{" "}
                <code className="font-mono not-italic">{src}</code>.
              </p>
            )}

            <div className="mt-10 pt-6 border-t border-rule">
              <Link href="/" className="text-sm text-muted hover:text-teal transition-colors">
                &larr; {t(p.backToFida)}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
