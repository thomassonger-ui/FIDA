"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ATTICUS_VERSION } from "@/lib/atticus-version";

/**
 * Full-screen welcome shown once right after sign-in (admin + student portal).
 * FIDA shield fades in to 30% behind a time-aware greeting and a single
 * "You have X tasks waiting" line, then continues to `next` after 5 seconds.
 * Rendered as a fixed overlay so it covers the admin/portal sidebar layouts.
 */
export function WelcomeScreen({
  eyebrow,
  firstName,
  tasks,
  next,
  cta,
  news,
}: {
  news?: { text: string; href: string; label: string };
  eyebrow: string;
  firstName?: string | null;
  tasks: number;
  next: string;
  cta: string;
}) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Welcome back");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    const START = 2400;
    const DUR = 5000;
    let raf = 0;
    let t0 = 0;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / DUR, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else router.replace(next);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, START);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [next, router]);

  const taskLine =
    tasks === 0
      ? "You're all caught up."
      : `You have ${tasks} ${tasks === 1 ? "task" : "tasks"} waiting.`;

  return (
    <div className="atticus-welcome fixed inset-0 z-[100] grid place-items-center overflow-hidden px-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/fida-shield.svg" alt="" aria-hidden="true" className="atticus-welcome-logo" />
      <div className="atticus-welcome-copy relative text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a87f2c]">{eyebrow}</div>
        <h1 className="mt-3.5 mb-2 font-display text-[clamp(32px,6vw,56px)] font-normal text-ink">
          {greeting}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-base text-muted">{taskLine}</p>
        {news ? (
          <p className="mx-auto mt-4 max-w-md text-sm text-ink">
            <span className="font-semibold text-[#a87f2c]">What&apos;s New in v{ATTICUS_VERSION}:</span> {news.text}{" "}
            <button type="button" onClick={() => router.replace(news.href)} className="underline underline-offset-2 hover:opacity-80">
              {news.label}
            </button>
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => router.replace(next)}
          className="mt-7 rounded-full bg-ink px-7 py-3 text-[15px] font-semibold text-white transition hover:opacity-90"
        >
          {cta} &rarr;
        </button>
      </div>
      <div className="absolute bottom-5 w-full text-center text-xs text-muted">
        Atticus&trade; v{ATTICUS_VERSION}
      </div>
      <div
        className="fixed bottom-0 left-0 h-0.5 bg-[#d4a74f] opacity-70"
        style={{ width: `${progress * 100}%` }}
      />
      <style>{`
        .atticus-welcome{background:#ffffff}
        .atticus-welcome-logo{position:absolute;top:50%;left:50%;height:min(60vmin,520px);width:auto;transform:translate(-50%,-50%);opacity:0;animation:atticusFade 2.4s ease-in-out forwards;pointer-events:none}
        .atticus-welcome-copy{opacity:0;animation:atticusIn 1.6s ease-in-out .8s forwards}
        @keyframes atticusFade{to{opacity:.3}}
        @keyframes atticusIn{to{opacity:1}}
        @media (prefers-reduced-motion:reduce){.atticus-welcome-logo{animation:none;opacity:.3}.atticus-welcome-copy{animation:none;opacity:1}}
      `}</style>
    </div>
  );
}

