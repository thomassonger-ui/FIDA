"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
    <header className="border-b border-rule bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-navy text-white font-display text-base leading-none pt-0.5"
          >
            A
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg text-navy tracking-tight">
              Blueprint School
            </span>
            <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-teal -mt-0.5">
              Institute
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-navy/70 hover:text-teal transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admissions"
            className="hidden sm:inline-flex items-center gap-1.5 bg-teal hover:bg-teal-deep text-white px-4 py-2 text-sm font-semibold rounded-md transition-colors"
          >
            Talk to Atticus
            <span aria-hidden="true">→</span>
          </Link>

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
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
          open ? "max-h-[400px] opacity-100 border-t border-rule" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="bg-white px-6 py-6 flex flex-col gap-1">
          {LINKS.map((l) => {
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
                {l.label}
                <span aria-hidden="true" className="text-teal">→</span>
              </Link>
            );
          })}
          <Link
            href="/admissions"
            className="mt-4 inline-flex items-center justify-center gap-1.5 bg-teal hover:bg-teal-deep text-white px-4 py-3 text-sm font-semibold rounded-md transition-colors"
          >
            Talk to Atticus
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
