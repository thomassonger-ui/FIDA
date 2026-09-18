"use client";

import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { about as a } from "@/lib/i18n/pages";
import { ScrollAutoplayVideo } from "@/components/landing/ScrollAutoplayVideo";

export function AboutContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HERO — the cohort photo, promoted from the bottom of the page.
            Full-bleed with the heading over it.

            The source is 1024x768, so it is upscaled on wide screens and will
            look softer than a native-width image would. object-cover plus the
            navy gradient hides most of that, but a higher-resolution original
            would render noticeably sharper if one exists.

            The gradient is not decoration: white text on an unpredictable
            photo fails contrast without it. priority + sizes="100vw" because
            this is the page's LCP element. */}
        <section className="relative border-b border-rule">
          <div className="relative h-[420px] md:h-[560px] w-full">
            <Image
              src="/photos/fida-dental-assisting-cohort-jacksonville.jpg"
              alt={t(a.cohortPhotoCaption)}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_35%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/30"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto w-full px-6 md:px-10 lg:px-12">
                <div className="max-w-3xl">
                  <div className="text-xs font-semibold tracking-[0.12em] uppercase text-white/80">
                    {t(a.eyebrow)}
                  </div>
                  <h1 className="mt-3 font-display text-4xl md:text-6xl text-white tracking-tight leading-[1.05]">
                    {t(a.heading)}
                  </h1>
                  <p className="mt-5 text-white/90 text-lg leading-relaxed">{t(a.intro)}</p>
                </div>
              </div>
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

        {/* The cohort photo used to sit here, in a captioned card. It is now
            the hero at the top of the page, so this section is gone rather
            than showing the same image twice. */}

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

        {/* FIDA STORY VIDEO — bottom of the page, before the CTA.
            Autoplays muted when scrolled into view with a sound control; see
            ScrollAutoplayVideo for why sound cannot start on its own. */}
        <section className="bg-paper-subtle border-t border-rule">
          <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-2xl">
              <div className="eyebrow">{t(a.videoEyebrow)}</div>
              <h2 className="mt-3 font-display text-3xl md:text-4xl text-navy tracking-tight">
                {t(a.videoHeading)}
              </h2>
              <p className="mt-4 text-muted leading-relaxed">{t(a.videoBody)}</p>
            </div>
            <div className="card bg-white overflow-hidden mt-8">
              <ScrollAutoplayVideo
                youtubeId={a.videoYoutubeId}
                title={t(a.videoTitle)}
              />
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
