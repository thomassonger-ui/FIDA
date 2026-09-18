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
        {/* HERO — split panel, not a full-bleed band.

            Why split: the source photo is 1024x768 (4:3 = 1.33). A full-width
            band at 1440x680 is 2.12:1, so object-cover had to discard ~400px
            of image height to fill it — and what it discarded was the
            students' bodies. Raising the crop point to keep text off their
            faces cut them off further. The two goals are in direct conflict in
            a wide band.

            Giving the photo its own column at roughly 55% width makes that
            column about 1.28:1 — near the source's own 1.33:1 — so almost
            nothing is cropped and the whole group fits.

            It also means NO dark overlay over the photo at all: the text sits
            on a solid navy panel, so contrast is a fixed, known quantity
            (white on #0B1F33, about 15:1) instead of something that depends on
            which part of a photograph happens to be behind a letter. The photo
            renders at its own exposure. */}
        <section className="border-b border-rule">
          <div className="grid grid-cols-1 lg:grid-cols-[45fr_55fr] items-stretch">
            {/* Text panel */}
            <div className="bg-navy flex items-center py-14 md:py-20 lg:py-0">
              <div className="w-full px-6 md:px-10 lg:pl-12 lg:pr-14 lg:max-w-[38rem] lg:ml-auto">
                <div className="text-xs font-semibold tracking-[0.12em] uppercase text-white/75">
                  {t(a.eyebrow)}
                </div>
                <h1 className="mt-3 font-display text-4xl md:text-5xl xl:text-6xl text-white tracking-tight leading-[1.05]">
                  {t(a.heading)}
                </h1>
                <p className="mt-5 text-white/90 text-lg leading-relaxed">{t(a.intro)}</p>
              </div>
            </div>

            {/* Photo. object-top keeps heads in frame while the near-matching
                column ratio leaves the bodies intact. */}
            <div className="relative min-h-[320px] sm:min-h-[420px] lg:min-h-[600px]">
              <Image
                src="/photos/fida-dental-assisting-cohort-jacksonville.jpg"
                alt={t(a.cohortPhotoCaption)}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[center_top]"
              />
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

        {/* FIDA STORY VIDEO — after the team, before the campus/licensure
            cards. Autoplays muted when scrolled into view with a sound
            control; see ScrollAutoplayVideo for why sound cannot start on its
            own. Plain background because TEAM directly above is tinted, and
            two tinted sections in a row read as one long band. */}
        <section className="border-t border-rule">
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
