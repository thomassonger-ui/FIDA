"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { nav, credentials } from "@/lib/i18n/home";
import { LanguageToggle } from "./LanguageToggle";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Institutional standing — a quiet line above the nav, not a promo.
          Sits outside the sticky header so it scrolls away with the page. */}
      <div className="bg-navy-deep text-navy-100">
        <p className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-2.5 md:py-0 md:h-8 flex flex-col md:flex-row items-center md:justify-start gap-y-1 gap-x-3 text-[10px] md:text-[11px] font-medium tracking-[0.1em] md:tracking-[0.14em] uppercase leading-none text-center md:text-left">
          <span>{t(credentials.barLicensed)}</span>
          <span aria-hidden="true" className="hidden md:inline text-teal-soft">&bull;</span>
          <span>{t(credentials.barApproved)}</span>
        </p>
      </div>
    <header className="border-b border-rule bg-white/95 backdrop-blur-md sticky top-0 z-40">
      {/* WCAG 2.4.1 Bypass Blocks — invisible until keyboard-focused. */}
      <a href="#main" className="skip-link">
        {t(nav.skipToContent)}
      </a>
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fida-shield.png"
            alt="FIDA"
            className="w-9 h-9 object-contain"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg text-navy tracking-tight">
              FIDA
            </span>
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-teal -mt-0.5">
              Institute
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {nav.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-navy/70 hover:text-teal transition-colors"
            >
              {t(l.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          <Link
            href="/portal/login"
            className="hidden lg:inline-flex items-center gap-1.5 text-navy/80 hover:text-teal border border-rule hover:border-teal px-3 py-2 text-sm font-semibold rounded-md transition-colors"
          >
            {t(nav.studentSignIn)}
          </Link>

          {/* Primary intake CTA — one click into registration from any page. */}
          <Link
            href="/atticus"
            className="hidden md:inline-flex items-center gap-1.5 bg-teal hover:bg-teal-deep text-white px-3 py-2 text-sm font-semibold rounded-md transition-colors"
          >
            {t(nav.atticusCta)}
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label={open ? t(nav.closeMenu) : t(nav.openMenu)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-rule text-navy hover:border-teal hover:text-teal transition-colors"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-down panel */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-[520px] opacity-100 border-t border-rule" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="bg-white px-6 py-6 flex flex-col gap-1">
          {nav.links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center justify-between px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  active
                    ? "bg-paper-subtle text-navy"
                    : "text-navy/80 hover:bg-paper-subtle hover:text-navy"
                }`}
              >
                {t(l.label)}
                <span aria-hidden="true" className="text-teal">→</span>
              </Link>
            );
          })}
          <Link
            href="/atticus"
            className="mt-4 inline-flex items-center justify-center gap-1.5 bg-teal hover:bg-teal-deep text-white px-4 py-3 text-sm font-semibold rounded-md transition-colors"
          >
            {t(nav.atticusCta)}
          </Link>
          <Link
            href="/portal/login"
            className="mt-2 inline-flex items-center justify-center gap-1.5 border border-rule text-navy px-4 py-3 text-sm font-semibold rounded-md transition-colors hover:border-teal hover:text-teal"
          >
            {t(nav.studentSignIn)}
          </Link>
        </nav>
      </div>
    </header>
    </>
  );
}
