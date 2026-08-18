"use client";

import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { tour as tr } from "@/lib/i18n/tourContact";

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/fldentalassisting/appointment";

/** /tour body — client component; the route keeps metadata. */
export function TourContent() {
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
              <div className="eyebrow">{t(tr.eyebrow)}</div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(tr.heading)}
              </h1>
              <p className="mt-6 text-muted text-lg leading-relaxed">
                {t(tr.intro)}
              </p>
              <p className="mt-4 text-navy leading-relaxed">{t(tr.note)}</p>
              <div className="mt-8">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  {t(tr.bookCta)} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* BOOK + VISIT */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card bg-white p-8 md:p-10">
              <div className="eyebrow">{t(tr.bookEyebrow)}</div>
              <h2 className="mt-3 font-display text-2xl md:text-3xl text-navy leading-tight">
                {t(tr.bookHeading)}
              </h2>
              <p className="mt-4 text-muted leading-relaxed">{t(tr.bookBody)}</p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6"
              >
                {t(tr.bookCta)} <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="card bg-white p-8 md:p-10">
              <div className="eyebrow">{t(tr.visitEyebrow)}</div>
              <h2 className="mt-3 font-display text-2xl md:text-3xl text-navy leading-tight">
                {t(tr.visitHeading)}
              </h2>
              <address className="not-italic mt-4 text-navy space-y-3 leading-relaxed">
                <p>{tr.address}</p>
                <p>
                  <span className="font-semibold">{t(tr.phoneLabel)}:</span>{" "}
                  <a
                    href="tel:+19046743131"
                    className="text-teal hover:underline"
                  >
                    (904) 674-3131
                  </a>
                </p>
                <p>
                  <span className="font-semibold">{t(tr.hoursLabel)}:</span>{" "}
                  {t(tr.hours)}
                </p>
              </address>
            </div>
          </div>
        </section>

        {/* BY THE NUMBERS */}
        <section className="bg-paper-subtle border-y border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl mb-10">
              <div className="eyebrow">{t(tr.numbersEyebrow)}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                {t(tr.numbersHeading)}
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tr.numbers.map((n, i) => (
                <div key={i} className="card bg-white p-6">
                  <div className="font-display text-4xl text-teal">{n.stat}</div>
                  <div className="mt-2 text-sm text-navy leading-relaxed">
                    {t(n.label)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy text-white">
          <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20 text-center">
            <h2 className="font-display text-3xl md:text-4xl leading-tight">
              {t(tr.ctaHeading)}
            </h2>
            <p className="mt-4 text-navy-100 text-lg max-w-xl mx-auto">
              {t(tr.ctaBody)}
            </p>
            <div className="mt-8">
              <Link href="/atticus" className="btn-primary">
                {t(tr.ctaButton)} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
