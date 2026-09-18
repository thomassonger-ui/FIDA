"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Fades its children up into place the first time they scroll into view.
 *
 * Two rules it follows that most scroll-reveal code doesn't:
 *
 * 1. Content is never hidden by default. The server renders it visible, and
 *    the hidden state is applied on mount only for elements that are BELOW the
 *    fold. So if JavaScript fails, is slow, or the element is already on
 *    screen, the reader sees content rather than an empty box — and nothing
 *    ever flashes out of view and back.
 *
 * 2. prefers-reduced-motion disables it entirely. Nothing moves, nothing
 *    fades; the content is simply there.
 *
 * `delay` staggers a row of cards so they arrive in sequence rather than as
 * one block. Keep it small — 60-120ms apart reads as one motion, more reads
 * as waiting.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  /* Before paint: hide it only if it is off screen. useLayoutEffect rather
     than useEffect so the hidden state lands in the same frame as mount and
     the element never appears and then vanishes. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) setHidden(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hidden) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setHidden(false);
          io.disconnect();
        }
      },
      /* A negative bottom margin means it triggers once the card is properly
         in the viewport, not the instant its top edge clips the bottom. */
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hidden]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        hidden ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
