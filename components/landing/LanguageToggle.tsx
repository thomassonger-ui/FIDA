"use client";

import { useLang } from "@/lib/i18n/LanguageProvider";
import { nav } from "@/lib/i18n/home";

/**
 * EN/ES switch. The label always names the language you'd switch TO,
 * which is the convention visitors expect from a globe control.
 */
export function LanguageToggle({
  className = "",
  full = false,
}: {
  /** Extra classes appended to the button. */
  className?: string;
  /** Full-width variant for the mobile menu panel. */
  full?: boolean;
}) {
  const { t, toggle, lang } = useLang();

  const base = full
    ? "w-full justify-center px-4 py-3 text-sm"
    : "px-3 py-2 text-sm";

  return (
    <button
      type="button"
      onClick={toggle}
      lang={lang === "en" ? "es" : "en"}
      aria-label={t(nav.switchAria)}
      className={`inline-flex items-center gap-1.5 rounded-md border border-rule text-navy/80 font-semibold transition-colors hover:border-teal hover:text-teal ${base} ${className}`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="3.2" ry="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.9 7.5h14.2M2.9 12.5h14.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      {t(nav.switchTo)}
    </button>
  );
}
