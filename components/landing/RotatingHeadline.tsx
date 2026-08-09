"use client";

import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/lib/i18n/LanguageProvider";
import { home } from "@/lib/i18n/home";

const HOLD_MS = 7000;

/**
 * Homepage H1 that crossfades English → Spanish → English until the visitor
 * picks a language, then locks to their choice.
 *
 * Both language variants are rendered into the same CSS grid cell so the
 * element is always sized to the taller of the two — nothing below the
 * headline shifts when it swaps. The variant that isn't showing is
 * aria-hidden so screen readers only ever announce one.
 *
 * Rotation is skipped entirely for visitors with prefers-reduced-motion.
 */
export function RotatingHeadline() {
  const { lang, auto } = useLang();
  const [shown, setShown] = useState<Lang>("en");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // Visitor has chosen (or asked for reduced motion) — hold their language.
    if (!auto || reduced) {
      setShown(lang);
      return;
    }
    const id = setInterval(
      () => setShown((prev) => (prev === "en" ? "es" : "en")),
      HOLD_MS,
    );
    return () => clearInterval(id);
  }, [auto, reduced, lang]);

  const variants: Lang[] = ["en", "es"];

  return (
    <h1 className="mt-6 grid text-white font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
      {variants.map((v) => (
        <span
          key={v}
          lang={v}
          aria-hidden={v !== shown}
          className={`col-start-1 row-start-1 transition-opacity duration-700 ease-in-out ${
            v === shown ? "opacity-100" : "opacity-0"
          }`}
        >
          {home.hero.titleLead[v]}
          <span className="text-teal-soft">{home.hero.titleAccent[v]}</span>
        </span>
      ))}
    </h1>
  );
}
