"use client";

/**
 * FIDA language layer.
 *
 * Client-side EN/ES switching with cookie persistence. Deliberately NOT
 * route-based (/es/...) so the existing SEO metadata, canonicals, and JSON-LD
 * on every page keep working untouched.
 *
 * Usage:
 *   const { lang, setLang, toggle, t } = useLang();
 *   <p>{t(copy.hero.subhead)}</p>
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "en" | "es";

/** Every translatable string is authored as this pair. */
export type Bilingual = { en: string; es: string };

const COOKIE = "fida_lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

type LanguageContextValue = {
  /** The locked language. Defaults to "en" until the visitor chooses. */
  lang: Lang;
  /** True until the visitor explicitly picks a language. */
  auto: boolean;
  setLang: (next: Lang) => void;
  toggle: () => void;
  /** Resolve a Bilingual pair against the current language. */
  t: (pair: Bilingual) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)fida_lang=(en|es)(?:;|$)/);
  return match ? (match[1] as Lang) : null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [auto, setAuto] = useState(true);

  // Rehydrate the visitor's saved choice after mount. Doing this in an effect
  // (rather than during render) keeps the server and first client render
  // identical, so there is no hydration mismatch.
  useEffect(() => {
    const saved = readCookie();
    if (saved) {
      setLangState(saved);
      setAuto(false);
    }
  }, []);

  // Keep <html lang> honest for screen readers and translation tools.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    setAuto(false);
    document.cookie = `${COOKIE}=${next};path=/;max-age=${ONE_YEAR};SameSite=Lax`;
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === "en" ? "es" : "en";
      document.cookie = `${COOKIE}=${next};path=/;max-age=${ONE_YEAR};SameSite=Lax`;
      return next;
    });
    setAuto(false);
  }, []);

  const t = useCallback((pair: Bilingual) => pair[lang], [lang]);

  const value = useMemo(
    () => ({ lang, auto, setLang, toggle, t }),
    [lang, auto, setLang, toggle, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fail soft rather than crash a page that forgot the provider.
    return {
      lang: "en",
      auto: true,
      setLang: () => {},
      toggle: () => {},
      t: (pair: Bilingual) => pair.en,
    };
  }
  return ctx;
}
