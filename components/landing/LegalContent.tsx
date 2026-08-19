"use client";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import type { LegalPage } from "@/lib/i18n/legal";

/**
 * Shared body for the five policy pages (/privacy, /terms, /accessibility,
 * /non-discrimination, /refund-policy). Routes stay server components and
 * keep their own metadata; content is bilingual via the standard provider.
 */
export function LegalContent({ page }: { page: LegalPage }) {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(page.eyebrow)}</div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-[1.05]">
                {t(page.title)}
              </h1>
              <p className="mt-3 text-sm text-subtle">{t(page.updated)}</p>
              <p className="mt-5 text-muted text-lg leading-relaxed">
                {t(page.intro)}
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
          <div className="max-w-3xl space-y-10">
            {page.sections.map((s) => (
              <div key={s.heading.en}>
                <h2 className="font-display text-2xl md:text-3xl text-navy tracking-tight">
                  {t(s.heading)}
                </h2>
                {s.body.map((p, i) => (
                  <p key={i} className="mt-4 text-navy/90 leading-relaxed">
                    {t(p)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
