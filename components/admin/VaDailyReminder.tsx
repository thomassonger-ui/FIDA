"use client";

// VA daily reminder — a pop-up in the center of the screen on /admin/prospects
// pages, for the VA only (signed in with her Atticus VA email — checked via
// /api/admin/va-clock). Shows once a day (Eastern time) through END_DATE, then
// never again. "Got it" closes it until tomorrow. Same pop-up as on
// tryatticus.com/console.

import { useEffect, useState } from "react";

const END_DATE = "2026-10-13";
const KEY = "va-daily-reminder";

const ITEMS = [
  "Clock in and out for each client you're working for",
  "Send detailed memos and messages directly from the page",
  "Review the VA Call Plan and Playbook for each client",
  "Allocate your time for the clients",
  "Sign in and out of Quo for each client",
];

const todayET = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

export function VaDailyReminder() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const today = todayET();
    if (today > END_DATE) return;
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(KEY);
    } catch {
      /* storage blocked — show it */
    }
    if (seen === today) return;
    fetch("/api/admin/va-clock", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { va_name?: string } | null) => {
        if (d?.va_name) setOpen(true);
      })
      .catch(() => {});
  }, []);

  function close() {
    try {
      localStorage.setItem(KEY, todayET());
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-sm border border-rule border-t-4 border-t-teal bg-white p-6 shadow-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Every day this week</p>
        <h2 className="mt-1 text-2xl font-semibold text-ink">Top 5 things to remember</h2>
        <ol className="mt-4 space-y-3">
          {ITEMS.map((t, i) => (
            <li key={t} className="flex items-start gap-3 text-[15px] leading-snug text-ink">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-1">{t}</span>
            </li>
          ))}
        </ol>
        <button onClick={close} className="mt-6 w-full rounded-sm bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-teal">
          Got it
        </button>
      </div>
    </div>
  );
}
