/**
 * AtticusCopyrightBar
 *
 * Global copyright footer carrying the Atticus mark + entity attribution.
 * Used on every page (admin, portal, public, gate, login, etc.) so the
 * provenance of the platform is visible end to end.
 *
 * Two visual variants:
 *   - "dark"  — white text on navy bg (default; fits on light-bg pages like
 *               admin and portal where it needs to feel like a real footer)
 *   - "light" — muted text on transparent bg (sits inside an existing
 *               dark footer like components/landing/Footer.tsx without
 *               looking like a duplicate)
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

  // Dark default
  return (
    <footer className="w-full bg-navy-deep text-white py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-xs">
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
    </footer>
  );
}
