"use client";

import Link from "next/link";
import { AtticusCopyrightBar } from "@/components/AtticusCopyrightBar";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { footer } from "@/lib/i18n/home";

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-navy-deep text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-10 text-sm">
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
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-navy-200">
          <div>
            &copy; {new Date().getFullYear()} {t(footer.rights)}
          </div>
          <AtticusCopyrightBar variant="light" />
        </div>
      </div>
    </footer>
  );
}
