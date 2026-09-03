"use client";

import Link from "next/link";
import { AtticusCopyrightBar } from "@/components/AtticusCopyrightBar";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { footer, credentials } from "@/lib/i18n/home";

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-navy-deep text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-10 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fida-shield.png"
                alt="FIDA"
                className="w-9 h-9 object-contain"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg tracking-tight">
                  FIDA
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-teal-soft -mt-0.5">
                  Institute
                </span>
              </span>
            </div>

            <address className="not-italic text-navy-100 space-y-2 leading-relaxed">
              <p>
                8761 Perimeter Park Blvd, Ste. 107
                <br />
                Jacksonville, FL 32216
              </p>
              <p>
                <a
                  href="tel:+19046743131"
                  className="hover:text-teal-soft transition-colors"
                >
                  (904) 674-3131
                </a>
                <span className="text-navy-200"> &middot; {t(footer.hours)}</span>
              </p>
              <p>
                <a
                  href="mailto:success@fldentalassisting.com"
                  className="hover:text-teal-soft transition-colors"
                >
                  success@fldentalassisting.com
                </a>
              </p>
            </address>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft mb-4">
              {t(footer.navigate)}
            </div>
            <ul className="space-y-3 text-navy-100">
              <li><Link href="/programs" className="hover:text-teal-soft transition-colors">{t(footer.programs)}</Link></li>
              <li><Link href="/tuition" className="hover:text-teal-soft transition-colors">{t(footer.tuition)}</Link></li>
              <li><Link href="/about" className="hover:text-teal-soft transition-colors">{t(footer.about)}</Link></li>
              <li><Link href="/contact" className="hover:text-teal-soft transition-colors">{t(footer.contact)}</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft mb-4">
              {t(footer.admissionsHeading)}
            </div>
            <ul className="space-y-3 text-navy-100">
              <li><Link href="/atticus" className="hover:text-teal-soft transition-colors">{t(footer.atticus)}</Link></li>
              <li><Link href="/atticus" className="hover:text-teal-soft transition-colors">{t(footer.startRegistration)}</Link></li>
              <li><Link href="/tour" className="hover:text-teal-soft transition-colors">{t(footer.tour)}</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft mb-4">
              {t(footer.support)}
            </div>
            <ul className="space-y-3 text-navy-100">
              <li><Link href="/tickets" className="hover:text-teal-soft transition-colors">{t(footer.submitTicket)}</Link></li>
              <li><Link href="/admin" className="hover:text-teal-soft transition-colors">{t(footer.adminDashboard)}</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft mb-4">
              {t(footer.policiesHeading)}
            </div>
            <ul className="space-y-3 text-navy-100">
              <li><Link href="/privacy" className="hover:text-teal-soft transition-colors">{t(footer.privacy)}</Link></li>
              <li><Link href="/terms" className="hover:text-teal-soft transition-colors">{t(footer.terms)}</Link></li>
              <li><Link href="/accessibility" className="hover:text-teal-soft transition-colors">{t(footer.accessibility)}</Link></li>
              <li><Link href="/non-discrimination" className="hover:text-teal-soft transition-colors">{t(footer.nonDiscrimination)}</Link></li>
              <li><Link href="/refund-policy" className="hover:text-teal-soft transition-colors">{t(footer.refunds)}</Link></li>
            </ul>
          </div>
        </div>

        {/* Verification statement — legible, understated, above the legal line. */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-6 shrink-0">
          <a
            href="https://www.fldoe.org/policy/cie/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center opacity-90 hover:opacity-100 transition-opacity"
            aria-label="Florida Department of Education — Commission for Independent Education"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fldoe-logo-dark.png"
              alt="Florida Department of Education"
              width={485}
              height={412}
              className="h-16 w-auto"
            />
          </a>
          <a
            href="https://floridasdentistry.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center opacity-90 hover:opacity-100 transition-opacity"
            aria-label="Florida Board of Dentistry"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fl-board-of-dentistry.png"
              alt="Florida Board of Dentistry"
              width={362}
              height={356}
              className="h-16 w-auto"
            />
          </a>
          </div>
          <p className="max-w-3xl text-xs leading-relaxed text-navy-100">
            {t(credentials.footerStatement)}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-navy-200">
          <div>
            &copy; {new Date().getFullYear()} {t(footer.rights)}
          </div>
          <AtticusCopyrightBar variant="light" />
        </div>
      </div>
    </footer>
  );
}
