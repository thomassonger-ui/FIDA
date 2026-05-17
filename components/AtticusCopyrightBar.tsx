/**
 * AtticusCopyrightBar
 *
 * Global copyright footer carrying the FIDA + Atticus mark + entity attribution.
 * Used on every page (admin, portal, public, gate, login, etc.) so the
 * provenance of the platform is visible end to end.
 *
 * Two visual variants:
 *   - "dark"  — full-width navy footer with FIDA copyright left, Atticus right
 *               (default; fits on light-bg pages like admin and portal where
 *               it needs to feel like a real footer)
 *   - "light" — muted text on transparent bg, content-sized inline block
 *               (sits inside an existing dark footer like
 *               components/landing/Footer.tsx without looking like a duplicate;
 *               parent controls positioning)
 */

type Variant = "dark" | "light";

export function AtticusCopyrightBar({ variant = "dark" }: { variant?: Variant }) {
  const year = new Date().getFullYear();

  if (variant === "light") {
    return (
      <div className="flex items-center justify-center gap-2 text-[11px] text-navy-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/atticus-logo.png"
          alt="Atticus"
          className="h-3.5 w-auto opacity-70"
        />
        <span>
          &copy; {year} Atticus &nbsp;|&nbsp; WorldTeachPathways dba WorldTeachESL LLC
        </span>
      </div>
    );
  }

  // Dark default — FIDA left, Atticus right
  return (
    <footer className="w-full bg-navy-deep text-white py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs">
        <div className="text-navy-200">
          &copy; {year} Florida Institute of Dental Assisting. All rights reserved.
        </div>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/atticus-logo.png"
            alt="Atticus"
            className="h-4 w-auto opacity-90"
          />
          <span className="text-navy-100">
            &copy; {year} Atticus &nbsp;|&nbsp; WorldTeachPathways dba WorldTeachESL LLC
          </span>
        </div>
      </div>
    </footer>
  );
}
