"use client";

import Link from "next/link";
import { useState } from "react";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { contact as c } from "@/lib/i18n/tourContact";

/**
 * /contact body — client component (form state); the route keeps metadata.
 *
 * The form submits into the existing ticket system (POST /api/tickets,
 * category "other") so every inquiry is logged and answerable from the admin
 * Messages queue — compliance requires logged communication, not loose email.
 * No SMS consent language (SMS channel removed 2026-05); phone is optional
 * and folded into the message body since tickets have no phone column.
 */
export function ContactContent() {
  const { t } = useLang();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("student_name", name);
      fd.set("category", "other");
      fd.set("subject", "Website contact form");
      fd.set(
        "body",
        phone.trim() ? `${message}\n\n[Phone: ${phone.trim()}]` : message,
      );

      const res = await fetch("/api/tickets", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setDone(true);
      } else {
        setError(data?.error || t(c.errGeneric));
      }
    } catch {
      setError(t(c.errGeneric));
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* WCAG 1.3.1 / 2.4.1 — named landmark, and the skip link target. */}
      <main id="main">
        {/* HEADER */}
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="eyebrow">{t(c.eyebrow)}</div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl lg:text-6xl text-navy tracking-tight leading-[1.05]">
                {t(c.heading)}
              </h1>
              <p className="mt-6 text-muted text-lg leading-relaxed">
                {t(c.intro)}
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: contact details */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <div className="eyebrow">{t(c.visitEyebrow)}</div>
                <address className="not-italic mt-3 text-navy leading-relaxed">
                  8761 Perimeter Park Blvd, Ste. 107
                  <br />
                  Jacksonville, FL 32216
                </address>
                <Link
                  href="/tour"
                  className="inline-block mt-2 text-sm font-semibold text-teal hover:underline"
                >
                  {t(c.tourLink)} <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div>
                <div className="eyebrow">{t(c.callEyebrow)}</div>
                <p className="mt-3">
                  <a
                    href="tel:+19046743131"
                    className="text-navy hover:text-teal transition-colors font-semibold"
                  >
                    (904) 674-3131
                  </a>
                </p>
              </div>

              <div>
                <div className="eyebrow">{t(c.hoursEyebrow)}</div>
                <p className="mt-3 text-navy">{t(c.hours)}</p>
              </div>
            </div>

            {/* Right: form */}
            <div className="lg:col-span-2">
              {done ? (
                <div className="card bg-white p-8 md:p-10 border-teal/30">
                  <div className="eyebrow text-teal">{t(c.successHeading)}</div>
                  <p className="mt-3 text-navy text-lg leading-relaxed">
                    {t(c.successBody)}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="card bg-white p-8 md:p-10"
                >
                  <div className="eyebrow">{t(c.formEyebrow)}</div>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl text-navy leading-tight">
                    {t(c.formHeading)}
                  </h2>
                  <p className="mt-3 text-sm text-muted leading-relaxed">
                    {t(c.formBody)}
                  </p>

                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold tracking-[0.12em] uppercase text-navy/70"
                      >
                        {t(c.nameLabel)}
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={120}
                        autoComplete="name"
                        className="mt-1.5 w-full border border-rule rounded-md px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold tracking-[0.12em] uppercase text-navy/70"
                      >
                        {t(c.emailLabel)}
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        maxLength={200}
                        autoComplete="email"
                        className="mt-1.5 w-full border border-rule rounded-md px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs font-semibold tracking-[0.12em] uppercase text-navy/70"
                    >
                      {t(c.phoneLabel)}
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={30}
                      autoComplete="tel"
                      inputMode="tel"
                      className="mt-1.5 w-full border border-rule rounded-md px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold tracking-[0.12em] uppercase text-navy/70"
                    >
                      {t(c.messageLabel)}
                    </label>
                    <textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      maxLength={8000}
                      rows={5}
                      className="mt-1.5 w-full border border-rule rounded-md px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  </div>

                  {error && (
                    <p
                      role="alert"
                      className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t(c.sending) : t(c.submit)}{" "}
                    <span aria-hidden="true">→</span>
                  </button>

                  <p className="mt-4 text-[11px] text-subtle leading-relaxed">
                    {t(c.consent)}
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
