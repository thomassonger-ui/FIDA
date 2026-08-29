"use client";

import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { about as a } from "@/lib/i18n/pages";

export function AboutContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HERO */}
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 md:py-24">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(a.eyebrow)}</div>
              <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(a.heading)}
              </h1>
              <p className="mt-6 text-muted text-lg leading-relaxed">{t(a.intro)}</p>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20">
          <div className="max-w-2xl mb-12">
            <div className="eyebrow">{t(a.valuesEyebrow)}</div>
            <h2 className="mt-3 font-display text-4xl text-navy tracking-tight">
              {t(a.valuesHeading)}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {a.values.map((v) => (
              <div key={v.title.en} className="card p-8 bg-white">
                <h3 className="font-display text-2xl text-navy leading-tight">
                  {t(v.title)}
                </h3>
                <p className="mt-3 text-muted leading-relaxed">{t(v.body)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COHORT PHOTO */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 pb-20">
          <Image
            src="/photos/fida-dental-assisting-cohort-jacksonville.jpg"
            alt="A cohort of FIDA dental assisting students under the Florida Institute of Dental Assisting sign"
            width={1024}
            height={768}
            sizes="(min-width: 800px) 800px, 100vw"
            className="mx-auto w-full max-w-[800px] rounded-lg shadow-card h-auto"
          />
        </section>

        {/* TEAM */}
        <section className="bg-paper-subtle border-t border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20">
            <div className="max-w-2xl mb-12">
              <div className="eyebrow">{t(a.teamEyebrow)}</div>
              <h2 className="mt-3 font-display text-4xl text-navy tracking-tight">
                {t(a.teamHeading)}
              </h2>
              <p className="mt-4 text-muted leading-relaxed">{t(a.teamIntro)}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {a.team.map((m) => (
                <div key={m.name} className="card p-8 bg-white">
                  {m.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt={m.name}
                      width={160}
                      height={160}
                      loading="lazy"
                      className="w-40 h-40 rounded-full object-cover object-top border-4 border-teal/30 mb-6"
                    />
                  )}
                  <h3 className="font-display text-2xl text-navy leading-tight">
                    {m.name}
                  </h3>
                  <div className="mt-1 text-sm font-semibold text-teal">
                    {t(m.role)}
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {t(m.credentials)}
                  </div>
                  <p className="mt-4 text-muted leading-relaxed">{t(m.bio)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LOCATION / LICENSURE / COHORT */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-20 border-t border-rule">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 bg-white">
              <div className="eyebrow">{t(a.locationEyebrowCampus)}</div>
              <div className="mt-3 font-display text-2xl text-navy">
                {t(a.campusTitle)}
              </div>
              <p className="mt-2 text-muted text-sm leading-relaxed">
                {t(a.campusBody)}
              </p>
            </div>
            <div className="card p-8 bg-white">
              <div className="eyebrow">{t(a.licensureEyebrow)}</div>
              <div className="mt-3 font-display text-2xl text-navy">
                {t(a.licensureTitle)}
              </div>
              <p className="mt-2 text-muted text-sm leading-relaxed">
                {t(a.licensureBody)}
              </p>
            </div>
            <div className="card p-8 bg-white">
              <div className="eyebrow">{t(a.cohortEyebrow)}</div>
              <div className="mt-3 font-display text-2xl text-navy">
                {t(a.cohortDate)}
              </div>
              <p className="mt-2 text-muted text-sm leading-relaxed">
                {t(a.cohortBody)}
              </p>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="bg-navy text-white">
          <div className="max-w-4xl mx-auto px-6 md:px-10 lg:px-12 py-20 text-center">
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              {t(a.ctaHeading)}
            </h2>
            <p className="mt-5 text-navy-100 text-lg max-w-xl mx-auto">
              {t(a.ctaBody)}
            </p>
            <div className="mt-10">
              <Link href="/tickets" className="btn-primary">
                {t(a.ctaButton)} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
