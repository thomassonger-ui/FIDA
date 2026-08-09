"use client";

import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { tickets as k } from "@/lib/i18n/pages";
import { NewTicketForm } from "@/app/tickets/new-ticket-form";

export function TicketsContent() {
  const { t } = useLang();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HERO */}
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(k.eyebrow)}</div>
              <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(k.headingLead)}
                <span className="text-teal">{t(k.headingAccent)}</span>
              </h1>
              <p className="mt-6 text-muted text-lg leading-relaxed max-w-2xl">
                {t(k.intro)}
              </p>
            </div>
          </div>
        </section>

        {/* BODY */}
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left: open a new ticket */}
            <div className="lg:col-span-3">
              <div className="eyebrow mb-3">{t(k.newTicketEyebrow)}</div>
              <h2 className="font-display text-3xl text-navy mb-2">
                {t(k.newTicketHeading)}
              </h2>
              <p className="text-muted text-sm mb-8 max-w-prose">
                {t(k.newTicketBody)}
              </p>
              <NewTicketForm />
            </div>

            {/* Right: how it works */}
            <aside className="lg:col-span-2 space-y-10">
              <div>
                <div className="eyebrow">{t(k.howEyebrow)}</div>
                <ol className="mt-5 space-y-5">
                  {k.steps.map((s) => (
                    <li key={s.n} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center font-display text-teal">
                        {s.n}
                      </div>
                      <div>
                        <div className="font-semibold text-navy">{t(s.title)}</div>
                        <p className="mt-1 text-muted text-sm leading-relaxed">
                          {t(s.body)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
